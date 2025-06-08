using Microsoft.Extensions.Options;
using Ordering.Data.Configurations;
using Stripe;
using System.Text.Json;

namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentCommand : IRequest<CreatePaymentResult>
    {
        public DraftOrderDto Order { get; init; } = default!;
        public string? CurrencyCode { get; init; }
        public PaymentMethodType PaymentMethod { get; init; } = PaymentMethodType.Stripe;
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
        private readonly ISender _mediator;

        public CreatePaymentHandler(
            IOptions<StripeSettings> stripeOpts,
            OrderingDbContext db,
            ISender mediator)    // <-- injekto ISender
        {
            _stripeSettings = stripeOpts.Value;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
            _db = db;
            _mediator = mediator;
        }

        public async Task<CreatePaymentResult> Handle(CreatePaymentCommand cmd, CancellationToken ct)
        {
            var d = cmd.Order;
            if (!Guid.TryParse(d.ShippingMethodId.ToString(), out var shipId))
                return new(false, null, null, "Invalid shippingMethodId");

            var ship = await _db.ShippingMethods
                .FirstOrDefaultAsync(x => x.Id == shipId, ct);
            if (ship == null) return new(false, null, null, "Shipping method not found");

            var subtotal = d.Items.Sum(i => i.Price * i.Quantity);
            var total = subtotal + ship.Cost;

            if (cmd.PaymentMethod == PaymentMethodType.CashOnDelivery)
            {
                var createOrderCmd = new Orders.CreateOrderCommand
                {
                    Order = d,
                    PaymentMethod = PaymentMethodType.CashOnDelivery,
                    CurrencyCode = cmd.CurrencyCode
                };

                var orderCreated = await _mediator.Send(createOrderCmd, ct);
                if (!orderCreated)
                    return new CreatePaymentResult(false, null, null, "Failed to create COD order");

                // order + payment have already been persisted by CreateOrderHandler
                return new CreatePaymentResult(true, null, null, null);
            }


            var dtoJson = JsonSerializer.Serialize(new DraftOrderDto(
                d.CustomerId, d.Items, d.ShippingMethodId, d.SavedAddressId, d.ShippingAddress,
                subtotal, ship.Cost, total));

            var metadata = new Dictionary<string, string>();
            const int CHUNK = 450;
            for (int i = 0, part = 0; i < dtoJson.Length; i += CHUNK, ++part)
            {
                var len = Math.Min(CHUNK, dtoJson.Length - i);
                metadata[$"order_chunk_{part}"] = dtoJson.Substring(i, len);
            }

            var opts = new PaymentIntentCreateOptions
            {
                Amount = (long)(total * 100),
                Currency = (cmd.CurrencyCode ?? "eur").ToLower(),
                Metadata = metadata
            };

            try
            {
                var intent = await new PaymentIntentService()
                    .CreateAsync(opts, null, ct);

                return new(true, intent.ClientSecret, intent.Id, null);
            }
            catch (StripeException ex)
            {
                return new(false, null, null, ex.Message);
            }
        }
    }
}
