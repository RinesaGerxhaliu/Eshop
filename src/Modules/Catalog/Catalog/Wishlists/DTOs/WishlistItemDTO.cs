namespace Catalog.Wishlists.DTOs;

public record WishlistItemDTO
(
    Guid Id,
    Guid WishlistId,
    Guid ProductId,
    decimal PriceWhenAdded,
    string ProductName
);
