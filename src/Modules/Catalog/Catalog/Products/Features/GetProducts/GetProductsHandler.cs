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
                .Include(p => p.Image)
                .OrderBy(p => p.Name)
                .Skip(pageSize * pageIndex)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            // map to DTOs (including ImageUrl via your Mapster config)
            var productDtos = products.Adapt<List<ProductDTO>>();

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
