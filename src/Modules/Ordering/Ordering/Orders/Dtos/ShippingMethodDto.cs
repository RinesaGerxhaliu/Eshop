namespace Ordering.Orders.Dtos;

public record ShippingMethodDto(
    Guid Id,
    string Name,
    decimal Cost
);
