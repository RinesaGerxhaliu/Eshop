namespace Catalog.Data.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly CatalogDbContext _dbContext;
        public ProductRepository(CatalogDbContext dbContext) => _dbContext = dbContext;

        public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct) =>
            _dbContext.Products
                .Include(p => p.Image)
                .FirstOrDefaultAsync(p => p.Id == id, ct);
        public async Task AddAsync(Product product, CancellationToken ct)
        {
            await _dbContext.Products.AddAsync(product, ct);
            await _dbContext.SaveChangesAsync(ct);
        }

        public async Task SaveAsync(Product product, CancellationToken ct)
        {
            _dbContext.Update(product);
            await _dbContext.SaveChangesAsync(ct);
        }
    }
}
