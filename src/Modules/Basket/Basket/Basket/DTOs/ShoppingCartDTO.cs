namespace Basket.Basket.DTOs
{
    public record ShoppingCartDTO
   (
        Guid Id,
        string UserName,
        List<ShoppingCartItemDTO> Items
    );
}
