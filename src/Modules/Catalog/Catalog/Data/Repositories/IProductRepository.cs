namespace Catalog.Data.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(Guid id, CancellationToken ct);

        Task AddAsync(Product product, CancellationToken ct);
        Task SaveAsync(Product product, CancellationToken ct);
    }
}
