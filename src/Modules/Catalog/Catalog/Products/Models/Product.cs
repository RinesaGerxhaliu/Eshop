namespace Catalog.Products.Models;

public class Product : Aggregate<Guid>
{
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = default!;

    private readonly List<ProductImage> _images = new();
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();

    public decimal Price { get; private set; }

    // Foreign Keys
    public Guid CategoryId { get; private set; }
    public Guid BrandId { get; private set; }


    public static Product Create (Guid id, string name, string description, decimal price)
    {
        ArgumentException.ThrowIfNullOrEmpty(name);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);

        var product = new Product
        {
            Id = id,
            Name = name,
            Description = description,
            Price = price
        };

        product.AddDomainEvent(new ProductCreatedEvent(product));

        return product;
    }

    public void Update (string name, string description, decimal price)
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
            throw new ArgumentException("Image URL cannot be empty.");

        var existingImage = _images.FirstOrDefault(img => img.ImageUrl == imageUrl);

        if (existingImage is not null)
        {
            return;
        }

        var image = new ProductImage(this.Id, imageUrl);
        _images.Add(image);
    }

    public void AssignCategory(Guid categoryId)
    {
        if (categoryId == Guid.Empty)
            throw new ArgumentException("Invalid category ID");

        CategoryId = categoryId;
    }
    public void AssignBrand(Guid brandId)
    {
        if (brandId == Guid.Empty)
            throw new ArgumentException("Invalid brand ID");

        BrandId = brandId;
    }


    public void RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(img => img.Id == imageId);

        if (image == null)
        {
            throw new InvalidOperationException($"Image with ID {imageId} not found.");
        }
        _images.Remove(image);
    }
}
