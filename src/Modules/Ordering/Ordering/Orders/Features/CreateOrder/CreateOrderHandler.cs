using Ordering.Shippings.Models;
using Ordering.Orders.Features.CreateOrder;

internal class CreateOrderHandler(OrderingDbContext dbContext)
    : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = Order.Create(
            Guid.NewGuid(),
            command.Order.CustomerId,
            command.Order.OrderName
        );

        foreach (var item in command.Order.Items)
        {
            order.Add(item.ProductId, item.Quantity, item.Price);
        }

        var shippingMethod = await dbContext.ShippingMethods
            .FirstOrDefaultAsync(sm => sm.Id == command.Order.ShippingMethodId, cancellationToken);

        if (shippingMethod is null)
            throw new Exception("Shipping method not found");

        ShippingAddress shippingAddress;
        Guid? savedAddressId = null;

        if (command.Order.SavedAddressId.HasValue)
        {
            var saved = await dbContext.SavedAddresses
                .Include(a => a.Address)
                .FirstOrDefaultAsync(a => a.Id == command.Order.SavedAddressId.Value, cancellationToken);

            if (saved is null)
                throw new Exception("Saved address not found");

            shippingAddress = saved.Address;
            savedAddressId = saved.Id;
        }
        else if (command.Order.ShippingAddress is not null)
        {
            shippingAddress = new ShippingAddress
            {
                Street = command.Order.ShippingAddress.Street,
                City = command.Order.ShippingAddress.City,
                State = command.Order.ShippingAddress.State,
                PostalCode = command.Order.ShippingAddress.PostalCode,
                Country = command.Order.ShippingAddress.Country,
                PhoneNumber = command.Order.ShippingAddress.PhoneNumber
            };
        }
        else
        {
            throw new Exception("Shipping address information is required");
        }

        var shipment = Shipment.Create(
            shipmentId: Guid.NewGuid(),
            orderId: order.Id,
            customerId: command.Order.CustomerId.ToString(),
            address: shippingAddress,
            method: shippingMethod,
            savedAddressId: savedAddressId
        );

        dbContext.Orders.Add(order);
        dbContext.Shipments.Add(shipment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateOrderResult(order.Id);
    }
}
