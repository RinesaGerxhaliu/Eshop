using Catalog.Brands.Models;
using Catalog.Categories.Models;

namespace Catalog.Products.Models;

public class Product : Aggregate<Guid>
{
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public decimal Price { get; private set; }

    // Foreign Keys
    public Guid CategoryId { get; private set; }
    public Guid BrandId { get; private set; }

    // One-to-one image navigation
    public ProductImage? Image { get; private set; }

    public static Product Create(
    Guid id,
    string name,
    string description,
    decimal price,
    Guid categoryId,
    Guid brandId)
    {
        ArgumentException.ThrowIfNullOrEmpty(name);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);
        if (categoryId == Guid.Empty)
            throw new ArgumentException("Category is required.", nameof(categoryId));
        if (brandId == Guid.Empty)
            throw new ArgumentException("Brand is required.", nameof(brandId));

        var product = new Product
        {
            Id = id,
            Name = name,
            Description = description,
            Price = price,
            CategoryId = categoryId,
            BrandId = brandId
        };

        product.AddDomainEvent(new ProductCreatedEvent(product));

        return product;
    }

    public void Update(string name, string description, decimal price)
    {
        ArgumentException.ThrowIfNullOrEmpty(name);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);

        Name = name;
        Description = description;
        Price = price;

        AddDomainEvent(new ProductPriceChangedEvent(this));

    }

    public void AddImage(string imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            throw new ArgumentException("Image URL cannot be empty.", nameof(imageUrl));

        // if the same URL is already set, do nothing
        if (Image is not null && Image.ImageUrl == imageUrl)
            return;

        Image = new ProductImage(this.Id, imageUrl);
    }

    public void RemoveImage(Guid imageId)
    {
        if (Image is null || Image.ProductId != imageId)
            throw new InvalidOperationException($"Image with ID {imageId} not found.");

        Image = null;
    }
}
