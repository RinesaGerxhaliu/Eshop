namespace Ordering.Orders.Dtos;

public record ShippingAddressDto(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country,
    string PhoneNumber
);
