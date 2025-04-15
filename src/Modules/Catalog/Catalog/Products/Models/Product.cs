namespace Catalog.Products.Models;

public class Product : Aggregate<Guid>
{
    public string Name { get; private set; } = default!;
    public string Description { get; private set; } = default!;

    //public string ImageFile { get; set; } = default!;
    public decimal Price { get; private set; } 

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

}
