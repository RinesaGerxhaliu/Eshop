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

            var results = await _db.Products
                .AsNoTracking()
                .Include(p => p.Image) // Include image if needed
                .Where(p => p.Name.ToLower().StartsWith(keyword)) // Use StartsWith instead of Contains
                .OrderBy(p => p.Name)
                .ToListAsync(ct);

            Console.WriteLine($"Results count: {results.Count}"); // Debug to see how many products were found

            // Map the results to DTO
            return results.Adapt<List<ProductDTO>>();
        }
    }
}
