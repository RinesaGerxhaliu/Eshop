using Ordering.Shippings.Models;
using Stripe;
using System.Text.Json;

public class StripeWebhookEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/webhook", async (HttpRequest request, OrderingDbContext db) =>
        {
            var json = await new StreamReader(request.Body).ReadToEndAsync();
            var sig = request.Headers["Stripe-Signature"];
            const string secret = "whsec_RLdsAR4D8FLLoKR8qxOVzzUiSbdvYRyH";

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, sig, secret);
            }
            catch (Exception e)
            {
                return Results.BadRequest($"Webhook error: {e.Message}");
            }

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var intent = (PaymentIntent)stripeEvent.Data.Object;

                var chunks = intent.Metadata
                    .Where(kvp => kvp.Key.StartsWith("order_chunk_"))
                    .OrderBy(kvp => kvp.Key)
                    .Select(kvp => kvp.Value);
                var dtoJson = string.Concat(chunks);
                var orderDto = JsonSerializer.Deserialize<DraftOrderDto>(dtoJson);
                if (orderDto is null)
                    return Results.BadRequest("Invalid order payload");

                var order = Order.Create(Guid.NewGuid(), orderDto.CustomerId);
                foreach (var item in orderDto.Items)
                    order.Add(item.ProductId, item.ProductName, item.Quantity, item.Price);

                var ship = await db.ShippingMethods
                    .FirstOrDefaultAsync(x => x.Id == orderDto.ShippingMethodId)
                    ?? throw new Exception("Shipping method not found");

                ShippingAddress addr;
                if (orderDto.SavedAddressId.HasValue)
                {
                    var saved = await db.SavedAddresses
                        .Include(a => a.Address)
                        .FirstOrDefaultAsync(a => a.Id == orderDto.SavedAddressId.Value)
                        ?? throw new Exception("Saved address not found");
                    addr = saved.Address;
                }
                else if (orderDto.ShippingAddress is not null)
                {
                    addr = new ShippingAddress
                    {
                        Street = orderDto.ShippingAddress.Street,
                        City = orderDto.ShippingAddress.City,
                        State = orderDto.ShippingAddress.State,
                        PostalCode = orderDto.ShippingAddress.PostalCode,
                        Country = orderDto.ShippingAddress.Country,
                        PhoneNumber = orderDto.ShippingAddress.PhoneNumber
                    };
                }
                else throw new Exception("Shipping address required");

                var shipment = Shipment.Create(
                    Guid.NewGuid(),
                    order.Id,
                    orderDto.CustomerId.ToString(),
                    addr,
                    ship,
                    orderDto.SavedAddressId
                );

                db.Orders.Add(order);
                db.Shipments.Add(shipment);

                var payment = Payment.CreateStripePayment(
                    Guid.NewGuid(),
                    order.Id,
                    intent.Id,
                    intent.ClientSecret!,
                    intent.Amount / 100m,
                    intent.Currency!.ToUpper()
                );
                payment.MarkAsSucceeded();
                db.Payments.Add(payment);

                await db.SaveChangesAsync();
            }

            return Results.Ok();
        })
        .RequireAuthorization()
        .WithName("StripeWebhook")
        .WithSummary("Handles Stripe payment_intent.succeeded")
        .Accepts<string>("application/json")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);
    }
}
