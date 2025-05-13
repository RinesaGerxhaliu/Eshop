namespace Ordering.Shippings.Models
{
    public record ShippingAddress
    {
        public string Street { get; init; } = default!;
        public string City { get; init; } = default!;
        public string State { get; init; } = default!;
        public string PostalCode { get; init; } = default!;
        public string Country { get; init; } = default!;
        public string PhoneNumber { get; init; } = default!;
    }
}
