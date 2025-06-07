namespace Ordering.Orders.Features.GetOrderById;

public record GetOrderByIdQuery(Guid Id)
    : IQuery<GetOrderByIdResult>;
public record GetOrderByIdResult(OrderDto Order);

internal class GetOrderByIdHandler(OrderingDbContext dbContext)
    : IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>
{
    public async Task<GetOrderByIdResult> Handle(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        // Merr order me items
        var order = await dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .SingleOrDefaultAsync(o => o.Id == query.Id, cancellationToken);

        if (order == null)
            throw new OrderNotFoundException(query.Id);

        // Merr shipment i order-it (nëse ekziston)
        var shipment = await dbContext.Shipments
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.OrderId == order.Id, cancellationToken);

        decimal subtotal = order.Items.Sum(i => i.Price * i.Quantity);
        decimal shippingCost = 0m;

        if (shipment != null)
        {
            // Për shembull, merr shipping cost nga ShippingMethod (duhet të bësh join/shkarkim shippingMethod)
            var shippingMethod = await dbContext.ShippingMethods
                .AsNoTracking()
                .FirstOrDefaultAsync(sm => sm.Id == shipment.ShippingMethodId, cancellationToken);

            if (shippingMethod != null)
                shippingCost = shippingMethod.Cost;
        }

        decimal total = subtotal + shippingCost;

        // Krijo DTO për adresën e shipment (nëse ekziston)
        ShippingAddressDto? shippingAddressDto = null;
        if (shipment != null && shipment.Address != null)
        {
            shippingAddressDto = new ShippingAddressDto(
                shipment.Address.Street,
                shipment.Address.City,
                shipment.Address.State,
                shipment.Address.PostalCode,
                shipment.Address.Country,
                shipment.Address.PhoneNumber);
        }

        var orderDto = new OrderDto(
            order.CustomerId,
            order.Items.Select(i => new OrderItemDto(i.ProductId,i.ProductName, i.Quantity, i.Price)).ToList(),
            shipment?.ShippingMethodId ?? Guid.Empty,
            shipment?.SavedAddressId,
            shippingAddressDto,
            subtotal,
            shippingCost,
            total
        );

        return new GetOrderByIdResult(orderDto);
    }
}

