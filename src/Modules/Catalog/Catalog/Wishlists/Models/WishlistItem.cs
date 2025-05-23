using System.Drawing;
using System.Text.Json.Serialization;

namespace Catalog.Wishlists.Models;

public class WishlistItem : Entity<Guid>
{
    public Guid WishlistId { get; private set; }
    public Guid ProductId { get; private set; }
    public decimal PriceWhenAdded { get; private set; }
    public string ProductName { get; private set; } = default!;

    internal WishlistItem(Guid wishListId, Guid productId, decimal priceWhenAdded, string productName)
    {
        WishlistId = wishListId;
        ProductId = productId;
        PriceWhenAdded = priceWhenAdded;
        ProductName = productName;
    }

    [JsonConstructor]
    public WishlistItem(Guid id, Guid wishlistId, Guid productId, decimal priceWhenAdded, string productName)
    {
        Id = id;
        WishlistId = wishlistId;
        ProductId = productId;
        PriceWhenAdded = priceWhenAdded;
        ProductName = productName;
    }
}
