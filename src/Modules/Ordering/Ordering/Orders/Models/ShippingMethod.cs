using System;

namespace Ordering.Orders.Models
{
    public class ShippingMethod : Entity<Guid>
    {
        internal ShippingMethod(Guid id, string name, decimal cost)
        {
            ArgumentException.ThrowIfNullOrEmpty(name, nameof(name));

            ArgumentOutOfRangeException.ThrowIfNegative(cost, nameof(cost));

            Id = id;
            Name = name;
            Cost = cost;
        }

        public string Name { get; private set; }
        public decimal Cost { get; private set; }

        public static ShippingMethod Create(Guid id, string name, decimal cost)
            => new ShippingMethod(id, name, cost);

        public void UpdateCost(decimal newCost)
        {
            ArgumentOutOfRangeException.ThrowIfNegative(newCost, nameof(newCost));
            Cost = newCost;
        }

    }
}
