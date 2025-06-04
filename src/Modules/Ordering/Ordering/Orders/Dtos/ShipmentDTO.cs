namespace Ordering.Orders.Dtos;

public record ShipmentDto(
    Guid Id,
    Guid OrderId,
    string CustomerId,
    ShippingAddressDto Address,
    Guid ShippingMethodId,
    ShipmentStatus Status,
    DateTime? ShippedDate,
    DateTime? DeliveredDate,
    Guid? SavedAddressId
);

