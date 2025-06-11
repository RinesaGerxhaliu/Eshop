namespace Ordering.Orders.Features.GetOrderByUserId;

public record GetUserOrdersQuery(Guid CustomerId)
    : IQuery<GetUserOrdersResult>;

public record GetUserOrdersResult(List<UserOrderDto> Orders);

public record UserOrderDto(
    Guid Id,
    decimal Total,
    List<OrderItemDto> Items,
    DateTime CreatedAt
);
internal class GetUserOrdersHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetUserOrdersQuery, GetUserOrdersResult>
{
    public async Task<GetUserOrdersResult> Handle(GetUserOrdersQuery query, CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == query.CustomerId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt) // 🔥 Sort from newest to oldest
            .ToListAsync(cancellationToken);

        var orderDtos = new List<UserOrderDto>();

        foreach (var order in orders)
        {
            var subtotal = order.Items.Sum(i => i.Price * i.Quantity);

            var shipment = await dbContext.Shipments
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.OrderId == order.Id, cancellationToken);

            decimal shippingCost = 0m;

            if (shipment != null)
            {
                var shippingMethod = await dbContext.ShippingMethods
                    .AsNoTracking()
                    .FirstOrDefaultAsync(sm => sm.Id == shipment.ShippingMethodId, cancellationToken);

                if (shippingMethod != null)
                    shippingCost = shippingMethod.Cost;
            }

            decimal total = subtotal + shippingCost;

            var itemDtos = order.Items
                .Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.Quantity, i.Price))
                .ToList();

            orderDtos.Add(new UserOrderDto(order.Id, total, itemDtos, order.CreatedAt)); 
        }

        return new GetUserOrdersResult(orderDtos);
    }
}

