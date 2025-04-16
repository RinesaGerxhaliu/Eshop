namespace Ordering.Orders.Dtos;
public record OrderDto(
    Guid Id,
    Guid CustomerId,
    string OrderName,
    List<OrderItemDto> Items
    );