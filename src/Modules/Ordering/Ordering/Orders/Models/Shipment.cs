using System;
using Ordering.Shippings.Models;

namespace Ordering.Orders.Models
{
    public enum ShipmentStatus
    {
        Pending,
        Shipped,
        Delivered,
        Cancelled
    }

    public class Shipment : Aggregate<Guid>
    {
        public Guid OrderId { get; private set; }
        public string CustomerId { get; private set; } = default!;
        public ShippingAddress Address { get; private set; }
        public Guid ShippingMethodId { get; private set; }
        public ShipmentStatus Status { get; private set; }
        public DateTime? ShippedDate { get; private set; }
        public DateTime? DeliveredDate { get; private set; }
        public Guid? SavedAddressId { get; private set; }

        private Shipment() { }

        public static Shipment Create(
            Guid shipmentId,
            Guid orderId,
            string customerId,
            ShippingAddress address,
            ShippingMethod method,
            Guid? savedAddressId)
        {
            if (string.IsNullOrWhiteSpace(customerId))
                throw new ArgumentNullException(nameof(customerId));

            var s = new Shipment
            {
                Id = shipmentId,
                OrderId = orderId,
                CustomerId = customerId,
                Address = address,
                ShippingMethodId = method.Id,
                Status = ShipmentStatus.Pending,
                SavedAddressId = savedAddressId
            };
            s.AddDomainEvent(new ShipmentCreatedEvent(s));
            return s;
        }

        public void MarkShipped(DateTime shippedOn)
        {
            if (Status != ShipmentStatus.Pending)
                throw new InvalidOperationException("Only pending shipments can be marked shipped.");

            ShippedDate = shippedOn;
            Status = ShipmentStatus.Shipped;
        }

        public void MarkDelivered(DateTime deliveredOn)
        {
            if (Status != ShipmentStatus.Shipped)
                throw new InvalidOperationException("Only shipped shipments can be marked delivered.");

            DeliveredDate = deliveredOn;
            Status = ShipmentStatus.Delivered;
        }
    }
}
