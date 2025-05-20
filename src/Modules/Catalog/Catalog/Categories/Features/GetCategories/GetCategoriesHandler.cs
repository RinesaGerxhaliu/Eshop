using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetCategories
{
    public record GetCategoriesQuery(PaginationRequest PaginationRequest) : IQuery<GetCategoriesResult>;

    public record GetCategoriesResult(PaginatedResult<CategoryDTO> Categories);

    internal class GetCategoriesHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetCategoriesQuery, GetCategoriesResult>
    {
        public async Task<GetCategoriesResult> Handle(GetCategoriesQuery q, CancellationToken ct)
        {
            var query = dbContext.Categories
                .AsNoTracking()
                .AsQueryable();

            var total = await query.LongCountAsync(ct);

            var dtos = await query
                .OrderBy(c => c.Name)
                .Skip(q.PaginationRequest.PageIndex * q.PaginationRequest.PageSize)
                .Take(q.PaginationRequest.PageSize)
                .Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    // EF Core will translate this into a SQL COUNT sub‐query
                    ProductCount = dbContext.Products
                        .Count(p => p.CategoryId == c.Id)
                })
                .ToListAsync(ct);

            var page = new PaginatedResult<CategoryDTO>(
                q.PaginationRequest.PageIndex,
                q.PaginationRequest.PageSize,
                total,
                dtos
            );

            return new GetCategoriesResult(page);
        }
    }
}
