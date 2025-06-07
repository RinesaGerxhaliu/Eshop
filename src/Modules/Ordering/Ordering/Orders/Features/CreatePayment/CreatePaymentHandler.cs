using Microsoft.Extensions.Options;
using Ordering.Data.Configurations;
using Ordering.Orders.Dtos;
using Ordering.Orders.Models;
using Ordering.Shippings.Models;
using Stripe;
using System.Text.Json;

namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentCommand : IRequest<CreatePaymentResult>
    {
        public DraftOrderDto Order { get; init; } = default!;
        public string? CurrencyCode { get; init; }
    }

    public class CreatePaymentResult
    {
        public bool Success { get; }
        public string? ClientSecret { get; }
        public string? PaymentIntentId { get; }
        public string? ErrorMessage { get; }
        public CreatePaymentResult(bool success, string? cs, string? pi, string? err)
            => (Success, ClientSecret, PaymentIntentId, ErrorMessage) = (success, cs, pi, err);
    }

    public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, CreatePaymentResult>
    {
        private readonly StripeSettings _stripeSettings;
        private readonly OrderingDbContext _db;

        public CreatePaymentHandler(IOptions<StripeSettings> stripeOpts, OrderingDbContext db)
        {
            _stripeSettings = stripeOpts.Value;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
            _db = db;
        }

        public async Task<CreatePaymentResult> Handle(CreatePaymentCommand cmd, CancellationToken ct)
        {
            var draftOrder = cmd.Order;

            Guid shippingMethodGuid;
            if (!Guid.TryParse(draftOrder.ShippingMethodId.ToString(), out shippingMethodGuid))
                return new CreatePaymentResult(false, null, null, "Shipping method id is invalid");

            var shippingMethod = await _db.ShippingMethods
                .FirstOrDefaultAsync(sm => sm.Id == shippingMethodGuid, ct);


            if (shippingMethod == null)
                return new CreatePaymentResult(false, null, null, "Shipping method not found");

            // Llogarit subtotal nga items
            decimal subtotal = draftOrder.Items.Sum(i => i.Price * i.Quantity);
            decimal shippingCost = shippingMethod.Cost;
            decimal total = subtotal + shippingCost;

            // Fillo DraftOrderDto për metadata me subtotal, shippingCost, total
            var orderForMeta = new DraftOrderDto(
                draftOrder.CustomerId,
                draftOrder.Items,
                draftOrder.ShippingMethodId,
                draftOrder.SavedAddressId,
                draftOrder.ShippingAddress,
                subtotal,
                shippingCost,
                total
            );
            var orderJson = JsonSerializer.Serialize(orderForMeta);

            var intentOptions = new PaymentIntentCreateOptions
            {
                Amount = (long)(total * 100m),
                Currency = (string.IsNullOrWhiteSpace(cmd.CurrencyCode) ? "eur" : cmd.CurrencyCode).ToLower(),
                Metadata = new Dictionary<string, string>
                {
                    { "order", orderJson }
                }
            };

            var service = new PaymentIntentService();
            PaymentIntent intent;
            try
            {
                intent = await service.CreateAsync(intentOptions, null, ct);
            }
            catch (StripeException ex)
            {
                return new CreatePaymentResult(false, null, null, ex.Message);
            }

            return new CreatePaymentResult(
                true,
                intent.ClientSecret!,
                intent.Id,
                null
            );
        }
    }
}
