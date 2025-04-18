namespace Catalog.Products.Services
{
    public class LocalImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;
        public LocalImageService(IWebHostEnvironment env) => _env = env;

        public async Task<string> SaveAsync(Stream fileStream, string fileName)
        {
            var folder = Path.Combine(_env.WebRootPath, "images");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            var unique = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
            var path = Path.Combine(folder, unique);
            using var fs = new FileStream(path, FileMode.Create);
            await fileStream.CopyToAsync(fs);
            return $"/images/{unique}";
        }

        public Task DeleteAsync(string imageUrl)
        {
            var file = Path.GetFileName(imageUrl);
            var path = Path.Combine(_env.WebRootPath, "images", file);
            if (File.Exists(path)) File.Delete(path);
            return Task.CompletedTask;
        }
    }
}
