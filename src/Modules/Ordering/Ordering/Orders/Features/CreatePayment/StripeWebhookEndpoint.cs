using Carter;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Ordering.Orders.Dtos;
using Ordering.Orders.Models;
using Ordering.Shippings.Models;
using Stripe;
using System.Text.Json;

public class StripeWebhookEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/payments/webhook", async (HttpRequest request, OrderingDbContext dbContext) =>
        {
            var json = await new StreamReader(request.Body).ReadToEndAsync();

            var stripeSignature = request.Headers["Stripe-Signature"];
            const string endpointSecret = "whsec_RLdsAR4D8FLLoKR8qxOVzzUiSbdvYRyH"; // replace this!

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, endpointSecret);
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Webhook error: {ex.Message}");
            }

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var intent = (PaymentIntent)stripeEvent.Data.Object;

                if (intent.Metadata.TryGetValue("order", out var orderJson))
                {
                    // 🟢 Use DraftOrderDto
                    var orderDto = JsonSerializer.Deserialize<DraftOrderDto>(orderJson);
                    if (orderDto is null)
                        return Results.BadRequest("Invalid order payload in metadata");

                    var order = Order.Create(
                        Guid.NewGuid(),
                        orderDto.CustomerId
                    );
                    foreach (var item in orderDto.Items)
                    {
                        order.Add(item.ProductId, item.Quantity, item.Price);
                    }

                    var shippingMethod = await dbContext.ShippingMethods
                        .FirstOrDefaultAsync(sm => sm.Id == orderDto.ShippingMethodId);
                    if (shippingMethod == null)
                        return Results.BadRequest("Shipping method not found");

                    ShippingAddress shippingAddress;
                    Guid? savedAddressId = null;
                    if (orderDto.SavedAddressId.HasValue)
                    {
                        var saved = await dbContext.SavedAddresses
                            .Include(a => a.Address)
                            .FirstOrDefaultAsync(a => a.Id == orderDto.SavedAddressId.Value);
                        if (saved == null)
                            return Results.BadRequest("Saved address not found");

                        shippingAddress = saved.Address;
                        savedAddressId = saved.Id;
                    }
                    else if (orderDto.ShippingAddress is not null)
                    {
                        shippingAddress = new ShippingAddress
                        {
                            Street = orderDto.ShippingAddress.Street,
                            City = orderDto.ShippingAddress.City,
                            State = orderDto.ShippingAddress.State,
                            PostalCode = orderDto.ShippingAddress.PostalCode,
                            Country = orderDto.ShippingAddress.Country,
                            PhoneNumber = orderDto.ShippingAddress.PhoneNumber
                        };
                    }
                    else
                    {
                        return Results.BadRequest("Shipping address required");
                    }

                    var shipment = Shipment.Create(
                        shipmentId: Guid.NewGuid(),
                        orderId: order.Id,
                        customerId: orderDto.CustomerId.ToString(),
                        address: shippingAddress,
                        method: shippingMethod,
                        savedAddressId: savedAddressId
                    );

                    dbContext.Orders.Add(order);
                    dbContext.Shipments.Add(shipment);

                    var payment = Payment.CreateStripePayment(
                        Guid.NewGuid(),
                        order.Id,
                        intent.Id,
                        intent.ClientSecret!,
                        intent.Amount / 100m,
                        intent.Currency!.ToUpper()
                    );
                    payment.MarkAsSucceeded();
                    dbContext.Payments.Add(payment);

                    await dbContext.SaveChangesAsync();
                    return Results.Ok();
                }
            }
            return Results.Ok();
        })
        .WithName("StripeWebhook")
        .WithSummary("Webhook endpoint for Stripe payment events")
        .Accepts<string>("application/json")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest);
    }
}
