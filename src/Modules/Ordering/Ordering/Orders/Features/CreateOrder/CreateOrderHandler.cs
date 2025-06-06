using Microsoft.EntityFrameworkCore;
using Ordering.Shippings.Models;
using Ordering.Orders.Models;
using Ordering.Orders.Features.CreateOrder;

internal class CreateOrderHandler : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    private readonly OrderingDbContext _dbContext;

    public CreateOrderHandler(OrderingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        // 1) Krijo entitetin Order
        var order = Order.Create(
            Guid.NewGuid(),
            command.Order.CustomerId,
            command.Order.OrderName
        );

        // 2) Shto çdo OrderItem
        foreach (var item in command.Order.Items)
        {
            order.Add(item.ProductId, item.Quantity, item.Price);
        }

        // 3) Merr ShippingMethod nga Db
        var shippingMethod = await _dbContext.ShippingMethods
            .FirstOrDefaultAsync(sm => sm.Id == command.Order.ShippingMethodId, cancellationToken);

        if (shippingMethod is null)
            throw new Exception("Shipping method not found");

        // 4) Përgatit ShippingAddress (nga SavedAddressId ose nga ShippingAddressDto)
        ShippingAddress shippingAddress;
        Guid? savedAddressId = null;

        if (command.Order.SavedAddressId.HasValue)
        {
            var saved = await _dbContext.SavedAddresses
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

        // 5) Krijo entitetin Shipment
        var shipment = Shipment.Create(
            shipmentId: Guid.NewGuid(),
            orderId: order.Id,
            customerId: command.Order.CustomerId.ToString(),
            address: shippingAddress,
            method: shippingMethod,
            savedAddressId: savedAddressId
        );

        // 6) Ruaj Order + Shipment në databazë
        _dbContext.Orders.Add(order);
        _dbContext.Shipments.Add(shipment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // 7) Llogarit “Subtotal” (Order.TotalPrice), “ShippingCost” (shippingMethod.Cost), dhe “Total”
        decimal subtotal = order.TotalPrice;
        decimal shippingCost = shippingMethod.Cost;
        decimal total = subtotal + shippingCost;

        // 8) Kthe CreateOrderResult me të gjitha këto vlera
        return new CreateOrderResult(
            Id: order.Id,
            Subtotal: subtotal,
            ShippingCost: shippingCost,
            Total: total
        );
    }
}
