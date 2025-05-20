namespace Catalog.Wishlists.DTOs;

public record WishlistDTO
(
    Guid Id,
    string CustomerId,
    List<WishlistItemDTO> Items
);
