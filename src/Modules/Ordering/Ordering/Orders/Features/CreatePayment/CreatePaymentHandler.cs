// File: Ordering/Orders/Features/CreatePayment/CreatePaymentHandler.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Ordering.Data;
using Ordering.Data.Configurations;
using Ordering.Orders.Models;
using Stripe;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, CreatePaymentResult>
    {
        private readonly OrderingDbContext _db;
        private readonly StripeSettings _stripeSettings;

        public CreatePaymentHandler(
            OrderingDbContext db,
            IOptions<StripeSettings> stripeOpts)
        {
            _db = db;
            _stripeSettings = stripeOpts.Value;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<CreatePaymentResult> Handle(CreatePaymentCommand cmd, CancellationToken ct)
        {
            // 1) Gjej Order-in me artikujt
            var order = await _db.Orders
                                 .Include(o => o.Items)
                                 .FirstOrDefaultAsync(o => o.Id == cmd.OrderId, ct);
            if (order == null)
                return new CreatePaymentResult(false, null, null, "Order not found");

            // 2) Kontroll idempotency për payments Pending
            var existingPayment = await _db.Payments
                .FirstOrDefaultAsync(p =>
                    p.OrderId == order.Id &&
                    p.Method == PaymentMethodType.Stripe &&
                    p.Status == PaymentStatus.Pending,
                    ct);
            if (existingPayment != null)
                return new CreatePaymentResult(
                    true,
                    existingPayment.ClientSecret!,
                    existingPayment.StripePaymentIntentId!,
                    null);

            // 3) Gjej shipment dhe shippingMethod për këtë order
            var shipment = await _db.Shipments
                .FirstOrDefaultAsync(s => s.OrderId == order.Id, ct);
            if (shipment == null)
                return new CreatePaymentResult(false, null, null, "Shipment not found");

            var shippingMethod = await _db.ShippingMethods
                .FirstOrDefaultAsync(sm => sm.Id == shipment.ShippingMethodId, ct);
            if (shippingMethod == null)
                return new CreatePaymentResult(false, null, null, "Shipping method not found");

            // 4) Llogarit subtotal + shippingCost
            decimal subtotal = order.TotalPrice;
            decimal shippingCost = shippingMethod.Cost;
            decimal total = subtotal + shippingCost;

            // 5) Konverto total-in në cent
            var amountInCents = (long)(total * 100m);

            // 6) Përgatisim PaymentIntentCreateOptions
            var intentOptions = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = (string.IsNullOrWhiteSpace(cmd.CurrencyCode)
                              ? order.CurrencyCode
                              : cmd.CurrencyCode).ToLower(),
                Metadata = new Dictionary<string, string>
                {
                    { "order_id", cmd.OrderId.ToString() }
                }
            };
            var requestOptions = new RequestOptions { IdempotencyKey = order.Id.ToString() };

            // 7) Krijo PaymentIntent
            var service = new PaymentIntentService();
            PaymentIntent intent;
            try
            {
                intent = await service.CreateAsync(intentOptions, requestOptions, ct);
            }
            catch (StripeException ex)
            {
                return new CreatePaymentResult(false, null, null, ex.Message);
            }

            // 8) Ruaj Payment në DB (AmountInCurrency = total)
            var newPayment = Payment.CreateStripePayment(
                Guid.NewGuid(),
                order.Id,
                intent.Id,
                intent.ClientSecret!,
                total,
                intent.Currency!.ToUpper()
            );
            _db.Payments.Add(newPayment);
            await _db.SaveChangesAsync(ct);

            // 9) Kthe clientSecret + paymentIntentId tek front-end
            return new CreatePaymentResult(
                true,
                intent.ClientSecret!,
                intent.Id,
                null
            );
        }
    }
}