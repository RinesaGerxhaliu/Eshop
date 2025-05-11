using Ordering.Shippings.Models;

namespace Ordering.Orders.Models
{
    public class SavedAddress : Entity<Guid>
    {
        public string CustomerId { get; private set; } = default!;

        public Guid ShippingAddressId { get; private set; }

        public ShippingAddress Address { get; private set; } = default!;

        public bool IsDefault { get; private set; }

        private SavedAddress() { }

        public static SavedAddress Create(
            Guid id,
            string customerId,
            ShippingAddress address,
            bool isDefault = false)
        {
            return new SavedAddress
            {
                Id = id,
                CustomerId = customerId,
                ShippingAddressId = address.Id,
                Address = address,
                IsDefault = isDefault
            };
        }
    }
}
