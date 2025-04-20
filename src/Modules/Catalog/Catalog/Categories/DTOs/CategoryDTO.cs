namespace Catalog.Categories.DTOs
{
    public record CategoryDTO
    {
        public Guid Id { get; init; } = Guid.Empty;
        public string Name { get; init; } = string.Empty;
    }
}