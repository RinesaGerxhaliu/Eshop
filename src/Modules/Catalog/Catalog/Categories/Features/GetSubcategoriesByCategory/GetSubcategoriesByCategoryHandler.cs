using Shared.Pagination;
using Catalog.Categories.DTOs;
using Catalog.Categories.Features.GetSubcategoriesByCategory.Catalog.Categories.Features.GetSubcategoriesByCategory;

namespace Catalog.Categories.Features.GetSubcategoriesByCategory
{
    internal class GetSubcategoriesByCategoryHandler
        : IQueryHandler<GetSubcategoriesByCategoryQuery, GetSubcategoriesByCategoryResult>
    {
        private readonly CatalogDbContext _db;

        public GetSubcategoriesByCategoryHandler(CatalogDbContext db) => _db = db;

        public async Task<GetSubcategoriesByCategoryResult> Handle(
            GetSubcategoriesByCategoryQuery q,
            CancellationToken ct)
        {
            var query = _db.Subcategories
                           .AsNoTracking()
                           .Where(s => s.CategoryId == q.CategoryId);

            var total = await query.LongCountAsync(ct);

            var entities = await query
                .OrderBy(s => s.Name)
                .Skip(q.PaginationRequest.PageIndex * q.PaginationRequest.PageSize)
                .Take(q.PaginationRequest.PageSize)
                .ToListAsync(ct);

            var dtos = entities
                .Select(s => new SubcategoryDto(s.Id, s.Name, s.CategoryId))
                .ToList();

            var page = new PaginatedResult<SubcategoryDto>(
                q.PaginationRequest.PageIndex,
                q.PaginationRequest.PageSize,
                total,
                dtos
            );

            return new GetSubcategoriesByCategoryResult(page);
        }
    }
}
