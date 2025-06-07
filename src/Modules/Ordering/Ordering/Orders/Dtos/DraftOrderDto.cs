// File: Ordering/Orders/Dtos/DraftOrderDto.cs
namespace Ordering.Orders.Dtos;

public record DraftOrderDto(
    Guid CustomerId,
    List<OrderItemDto> Items,
    Guid ShippingMethodId,
    Guid? SavedAddressId,
    ShippingAddressDto? ShippingAddress,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total
);
