namespace Ordering.Orders.Dtos;

public record OrderDto(
    Guid Id,
    Guid CustomerId,
    DateTime CretaedAt,
    List<OrderItemDto> Items,
    Guid ShippingMethodId,                      
    Guid? SavedAddressId,                       
    ShippingAddressDto? ShippingAddress,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total
);
