namespace Catalog.Brands.DTOs
{
    public record BrandDTO
    {
        public Guid Id { get; init; } = Guid.Empty;
        public string Name { get; init; } = string.Empty;
    }
}