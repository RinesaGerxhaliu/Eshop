namespace Ordering.Orders.Features.GetShipmentByOrderId;

public record GetShipmentByOrderIdQuery(Guid OrderId) : IRequest<GetShipmentByOrderIdResult>;

public record GetShipmentByOrderIdResult(
    Guid Id,
    Guid OrderId,
    string CustomerId,
    ShippingAddressDto Address,
    Guid ShippingMethodId,
    ShipmentStatus Status,
    DateTime? ShippedDate,
    DateTime? DeliveredDate,
    Guid? SavedAddressId
);

internal class GetShipmentByOrderIdHandler
    : IRequestHandler<GetShipmentByOrderIdQuery, GetShipmentByOrderIdResult>
{
    private readonly OrderingDbContext _dbContext;

    public GetShipmentByOrderIdHandler(OrderingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GetShipmentByOrderIdResult> Handle(GetShipmentByOrderIdQuery query, CancellationToken cancellationToken)
    {
        var shipment = await _dbContext.Shipments
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrderId == query.OrderId, cancellationToken);

        if (shipment == null)
            throw new Exception("Shipment not found for this OrderId");

        return new GetShipmentByOrderIdResult(
            shipment.Id,
            shipment.OrderId,
            shipment.CustomerId,
            new ShippingAddressDto(
                shipment.Address.Street,
                shipment.Address.City,
                shipment.Address.State,
                shipment.Address.PostalCode,
                shipment.Address.Country,
                shipment.Address.PhoneNumber),
            shipment.ShippingMethodId,
            shipment.Status,
            shipment.ShippedDate,
            shipment.DeliveredDate,
            shipment.SavedAddressId
        );
    }
}


