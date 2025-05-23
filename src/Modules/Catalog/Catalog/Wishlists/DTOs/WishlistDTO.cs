namespace Catalog.Wishlists.DTOs;

public record WishlistDTO
(
    Guid Id,
    string UserName,
    List<WishlistItemDTO> Items
);
