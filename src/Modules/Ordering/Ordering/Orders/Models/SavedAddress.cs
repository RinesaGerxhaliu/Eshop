using Ordering.Shippings.Models;

namespace Ordering.Orders.Models
{
    public class SavedAddress : Entity<Guid>
    {
        public string CustomerId { get; private set; } = default!;

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
                Address = address,
                IsDefault = isDefault
            };
        }
    }
}
