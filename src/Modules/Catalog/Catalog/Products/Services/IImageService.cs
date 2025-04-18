namespace Catalog.Products.Services
{
    public interface IImageService
    {
        Task<string> SaveAsync(Stream fileStream, string fileName);
        Task DeleteAsync(string imageUrl);
    }
}
