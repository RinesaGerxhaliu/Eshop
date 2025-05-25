namespace Ordering.Orders.Dtos;

public record OrderDto(
    Guid CustomerId,
    string OrderName,
    List<OrderItemDto> Items,
    Guid ShippingMethodId,                      
    Guid? SavedAddressId,                       
    ShippingAddressDto? ShippingAddress         
);
