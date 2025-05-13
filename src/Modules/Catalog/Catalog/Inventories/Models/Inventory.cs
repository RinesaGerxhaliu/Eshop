namespace Catalog.Inventories.Models
{
    public class Inventory : Entity<Guid>
    {
        public Guid ProductId { get; private set; }
        public int QuantityAvailable { get; private set; }
        public int QuantityReserved { get; private set; } // Optional
        public int QuantitySold { get; private set; } // Optional

        public DateTime LastUpdated { get; private set; }

        private Inventory() { }

        public static Inventory Create(Guid id, Guid productId, int initialQuantity)
        {
            if (initialQuantity < 0)
                throw new ArgumentOutOfRangeException(nameof(initialQuantity), "Quantity cannot be negative.");

            return new Inventory
            {
                Id = id,
                ProductId = productId,
                QuantityAvailable = initialQuantity,
                QuantityReserved = 0,
                QuantitySold = 0,
                LastUpdated = DateTime.UtcNow
            };
        }
    }

}
