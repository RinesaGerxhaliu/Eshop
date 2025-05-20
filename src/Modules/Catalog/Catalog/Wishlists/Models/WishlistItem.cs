namespace Catalog.Wishlists.Models;

public class WishlistItem : Entity<Guid>
{
    public Guid WishlistId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal PriceWhenAdded { get; private set; }
    public string ProductName { get; private set; } = default!;

    internal WishlistItem(
        Guid wishlistId,
        Guid productId,
        decimal priceWhenAdded,
        string productName)
    {
        Id = Guid.NewGuid();
        WishlistId = wishlistId;
        ProductId = productId;
        PriceWhenAdded = priceWhenAdded;
        ProductName = productName;
    }
}
