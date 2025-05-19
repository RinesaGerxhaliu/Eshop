namespace Catalog.Categories.DTOs
{
    public record SubcategoryDto(
        Guid Id,
        string Name,
        Guid CategoryId
    );
}
