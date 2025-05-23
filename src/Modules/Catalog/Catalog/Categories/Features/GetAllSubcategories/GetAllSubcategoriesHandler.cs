using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetAllSubcategories
{
    internal class GetAllSubcategoriesHandler
        : IQueryHandler<GetAllSubcategoriesQuery, GetAllSubcategoriesResult>
    {
        private readonly CatalogDbContext _db;

        public GetAllSubcategoriesHandler(CatalogDbContext db) => _db = db;

        public async Task<GetAllSubcategoriesResult> Handle(GetAllSubcategoriesQuery q, CancellationToken ct)
        {
            var query = _db.Subcategories.AsNoTracking();

            var total = await query.LongCountAsync(ct);

            var entities = await query
                .OrderBy(s => s.Name)
                .Skip(q.Pagination.PageIndex * q.Pagination.PageSize)
                .Take(q.Pagination.PageSize)
                .ToListAsync(ct);

            var dtos = entities
                .Select(s => new SubcategoryDto(s.Id, s.Name, s.CategoryId))
                .ToList();

            var page = new PaginatedResult<SubcategoryDto>(
                q.Pagination.PageIndex,
                q.Pagination.PageSize,
                total,
                dtos
            );

            return new GetAllSubcategoriesResult(page);
        }
    }
}
