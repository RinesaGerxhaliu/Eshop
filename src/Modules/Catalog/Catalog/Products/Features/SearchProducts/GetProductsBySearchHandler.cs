using Shared.Pagination;

namespace Catalog.Products.Features.Search
{
    internal class GetProductsBySearchHandler
      : IQueryHandler<GetProductsBySearchQuery, PaginatedResult<ProductDTO>>
    {
        private readonly CatalogDbContext _db;

        public GetProductsBySearchHandler(CatalogDbContext db) => _db = db;

        public async Task<PaginatedResult<ProductDTO>> Handle(GetProductsBySearchQuery q, CancellationToken ct)
        {
            var keyword = q.Query.ToLower();
            var query = _db.Products.AsNoTracking().Include(p => p.Image)
                .Where(p => p.Name.ToLower().Contains(keyword));

            if (q.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == q.CategoryId);

            if (q.MinPrice.HasValue)
                query = query.Where(p => p.Price >= q.MinPrice);

            if (q.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= q.MaxPrice);

            if (q.BrandId.HasValue)
                query = query.Where(p => p.BrandId == q.BrandId);

            var total = await query.LongCountAsync(ct);

            var entities = await query
                .OrderBy(p => p.Name)
                .Skip(q.PaginationRequest.PageIndex * q.PaginationRequest.PageSize)
                .Take(q.PaginationRequest.PageSize)
                .ToListAsync(ct);

            var dtos = entities.Adapt<List<ProductDTO>>();

            return new PaginatedResult<ProductDTO>(
                q.PaginationRequest.PageIndex,
                q.PaginationRequest.PageSize,
                total,
                dtos
            );
        }
    }
}
