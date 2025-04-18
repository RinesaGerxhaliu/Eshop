using Shared.Pagination;
using Microsoft.EntityFrameworkCore;    // ← for Include(...)

namespace Catalog.Products.Features.GetProducts
{
    public record GetProductsQuery(PaginationRequest PaginationRequest)
        : IQuery<GetProductsResult>;

    public record GetProductsResult(PaginatedResult<ProductDTO> Products);

    internal class GetProductsHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetProductsQuery, GetProductsResult>
    {
        public async Task<GetProductsResult> Handle(GetProductsQuery query,
            CancellationToken cancellationToken)
        {
            var pageIndex = query.PaginationRequest.PageIndex;
            var pageSize = query.PaginationRequest.PageSize;

            var totalCount = await dbContext.Products.LongCountAsync(cancellationToken);

            // ← just added Include(p => p.Images) here
            var products = await dbContext.Products
                .AsNoTracking()
                .Include(p => p.Images)
                .OrderBy(p => p.Name)
                .Skip(pageSize * pageIndex)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            // unchanged: map to DTOs
            var productDtos = products.Adapt<List<ProductDTO>>();

            // ← populate the ImageUrl on each DTO
            for (var i = 0; i < products.Count; i++)
            {
                var firstUrl = products[i].Images
                    .OrderBy(img => img.Id)
                    .Select(img => img.ImageUrl)
                    .FirstOrDefault();

                // since ProductDTO.ImageUrl is init‑only, use a with‑expression
                productDtos[i] = productDtos[i] with { ImageUrl = firstUrl };
            }

            return new GetProductsResult(
                new PaginatedResult<ProductDTO>(
                    pageIndex,
                    pageSize,
                    totalCount,
                    productDtos
                )
            );
        }
    }
}
