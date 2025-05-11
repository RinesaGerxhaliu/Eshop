namespace Ordering.Orders.Events
{
    public record ShipmentCreatedEvent(
         Shipment Shipment
     ) : IDomainEvent;

}
