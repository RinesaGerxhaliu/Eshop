using Ordering.Shippings.Models;

namespace Ordering.Orders.Features.Orders
{
    public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, bool>
    {
        private readonly OrderingDbContext _db;

        public CreateOrderHandler(OrderingDbContext db) => _db = db;

        public async Task<bool> Handle(CreateOrderCommand cmd, CancellationToken ct)
        {
            var d = cmd.Order;

            var order = Order.Create(Guid.NewGuid(), d.CustomerId);
            foreach (var i in d.Items)
                order.Add(i.ProductId, i.ProductName, i.Quantity, i.Price);

            var ship = await _db.ShippingMethods
                .FirstOrDefaultAsync(x => x.Id == d.ShippingMethodId, ct)
                ?? throw new Exception("Shipping method not found");

            ShippingAddress address;
            if (d.SavedAddressId.HasValue)
            {
                var saved = await _db.SavedAddresses
                    .Include(x => x.Address)
                    .FirstOrDefaultAsync(x => x.Id == d.SavedAddressId.Value, ct)
                    ?? throw new Exception("Saved address not found");
                address = saved.Address;
            }
            else if (d.ShippingAddress != null)
            {
                address = new ShippingAddress
                {
                    Street = d.ShippingAddress.Street,
                    City = d.ShippingAddress.City,
                    State = d.ShippingAddress.State,
                    PostalCode = d.ShippingAddress.PostalCode,
                    Country = d.ShippingAddress.Country,
                    PhoneNumber = d.ShippingAddress.PhoneNumber
                };
            }
            else throw new Exception("No shipping address");

            var shipment = Shipment.Create(Guid.NewGuid(), order.Id, d.CustomerId.ToString(), address, ship, d.SavedAddressId);
            _db.Orders.Add(order);
            _db.Shipments.Add(shipment);


            decimal totalAmount = d.Total;
            Payment payment = cmd.PaymentMethod == PaymentMethodType.CashOnDelivery
                ? Payment.CreateCashOnDeliveryPayment(Guid.NewGuid(), order.Id, totalAmount, cmd.CurrencyCode ?? "EUR")
                : Payment.CreateStripePayment(Guid.NewGuid(), order.Id, cmd.StripePaymentIntentId!, null!, totalAmount, cmd.CurrencyCode ?? "EUR");

            payment.MarkAsSucceeded();
            _db.Payments.Add(payment);

            await _db.SaveChangesAsync(ct);
            return true;
        }
    }
}
