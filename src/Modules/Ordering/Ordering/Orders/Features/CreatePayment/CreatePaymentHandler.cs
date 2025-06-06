using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Ordering.Data;          // the namespace where your OrderingDbContext is
using Ordering.Data.Configurations;
using Ordering.Orders.Models;
using Stripe;
using System;
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
        }

        public async Task<CreatePaymentResult> Handle(CreatePaymentCommand cmd, CancellationToken ct)
        {
            // 1. Load the Order from DbContext directly
            var order = await _db.Orders
                                 .Include(o => o.Items)
                                 .FirstOrDefaultAsync(o => o.Id == cmd.OrderId, ct);

            if (order is null)
                return new CreatePaymentResult(false, null, null, "Order not found");

            // … rest of your Stripe logic remains the same …

            var amountDecimal = order.TotalPrice;
            var amountInCents = (long)Math.Round(amountDecimal * 100M, 0);

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = (string.IsNullOrWhiteSpace(cmd.CurrencyCode) ? order.CurrencyCode : cmd.CurrencyCode).ToLower(),
                Metadata = new Dictionary<string, string>
                {
                    { "order_id", cmd.OrderId.ToString() }
                }
            };

            var service = new PaymentIntentService();
            PaymentIntent intent;
            try
            {
                intent = await service.CreateAsync(options, cancellationToken: ct);
            }
            catch (StripeException ex)
            {
                return new CreatePaymentResult(false, null, null, ex.Message);
            }

            // 2. (Optional) If you want to persist a Payment entity,
            //    you can do it here using _db.Payments.Add(...) + _db.SaveChangesAsync().

            return new CreatePaymentResult(
                true,
                intent.ClientSecret!,
                intent.Id,
                null
            );
        }
    }
}
