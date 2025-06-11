namespace Basket.Basket.DTOs
{
    public record ShoppingCartItemDTO
   (
        Guid Id,
        Guid ShoppingCartId,
        Guid ProductId,
        int Quantity,
        decimal Price,
        string ProductName
    );
}
