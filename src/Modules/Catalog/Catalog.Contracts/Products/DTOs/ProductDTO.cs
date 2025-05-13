namespace Catalog.Contracts.Products.DTOs
{
    public record ProductDTO
    {
        public Guid Id { get; init; } = Guid.Empty;
        public string Name { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public string? ImageUrl { get; init; }
        public Guid CategoryId { get; init; }
        public Guid BrandId { get; init; }

        public Guid? SubcategoryId { get; init; }
    }
}
