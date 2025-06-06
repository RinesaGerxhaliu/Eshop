namespace Ordering.Orders.Dtos
{
    // A small DTO intended only for "GET /orders/{id}" responses.
    public record GetOrderDetailsDto(
        Guid OrderId,
        List<OrderItemDto> Items,
        decimal Subtotal,
        decimal ShippingCost,
        decimal Total,
        ShippingAddressDto? ShippingAddress
    );
}
