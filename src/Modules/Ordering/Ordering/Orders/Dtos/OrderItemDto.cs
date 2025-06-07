namespace Ordering.Orders.Dtos;
public record OrderItemDto(Guid ProductId, string ProductName, int Quantity, decimal Price);