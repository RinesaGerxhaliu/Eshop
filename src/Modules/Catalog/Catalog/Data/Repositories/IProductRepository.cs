namespace Catalog.Data.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(Guid id, CancellationToken ct);
        Task SaveAsync(Product product, CancellationToken ct);
    }
}
