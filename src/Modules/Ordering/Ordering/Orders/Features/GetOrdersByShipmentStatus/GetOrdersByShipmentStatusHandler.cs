namespace Ordering.Orders.Features.GetOrdersByShipmentStatus;

public record GetOrdersByShipmentStatusQuery(ShipmentStatus Status) : IRequest<GetOrdersByShipmentStatusResult>;

public record OrderSummaryDto(
    Guid OrderId,
    Guid ShipmentId,
    ShipmentStatus Status,
    string OrderName,
    Guid CustomerId
);

public record GetOrdersByShipmentStatusResult(List<OrderSummaryDto> Orders);

internal class GetOrdersByShipmentStatusHandler
    : IRequestHandler<GetOrdersByShipmentStatusQuery, GetOrdersByShipmentStatusResult>
{
    private readonly OrderingDbContext _dbContext;

    public GetOrdersByShipmentStatusHandler(OrderingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GetOrdersByShipmentStatusResult> Handle(GetOrdersByShipmentStatusQuery query, CancellationToken cancellationToken)
    {
        var shipmentsWithOrders = await _dbContext.Shipments
            .AsNoTracking()
            .Where(s => s.Status == query.Status)
            .Join(_dbContext.Orders,
                shipment => shipment.OrderId,
                order => order.Id,
                (shipment, order) => new OrderSummaryDto(
                    order.Id,
                    shipment.Id,
                    shipment.Status,
                    order.OrderName,
                    order.CustomerId))
            .ToListAsync(cancellationToken);

        return new GetOrdersByShipmentStatusResult(shipmentsWithOrders);
    }

}

