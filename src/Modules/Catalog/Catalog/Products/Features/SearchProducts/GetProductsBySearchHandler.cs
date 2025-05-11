namespace Catalog.Products.Features.Search
{
    internal class GetProductsBySearchHandler
        : IQueryHandler<GetProductsBySearchQuery, List<ProductDTO>>
    {
        private readonly CatalogDbContext _db;

        public GetProductsBySearchHandler(CatalogDbContext db) => _db = db;

        public async Task<List<ProductDTO>> Handle(GetProductsBySearchQuery q, CancellationToken ct)
        {
            var keyword = q.Query.ToLower();
            var query = _db.Products.AsNoTracking().Include(p => p.Image)
                .Where(p => p.Name.ToLower().Contains(keyword));  // Këtu përdorim Contains

            if (q.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == q.CategoryId);

            if (q.MinPrice.HasValue)
                query = query.Where(p => p.Price >= q.MinPrice);

            if (q.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= q.MaxPrice);

            if (q.BrandId.HasValue)
                query = query.Where(p => p.BrandId == q.BrandId);

            var results = await query.OrderBy(p => p.Name).ToListAsync(ct);

            return results.Adapt<List<ProductDTO>>();
        }

    }
}
