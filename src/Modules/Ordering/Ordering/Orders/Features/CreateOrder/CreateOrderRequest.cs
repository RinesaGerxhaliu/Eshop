namespace Ordering.Orders.Features.CreateOrder;

public record CreateOrderRequest(OrderDto Order);

public record CreateOrderResponse(
    Guid Id,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Total
);

