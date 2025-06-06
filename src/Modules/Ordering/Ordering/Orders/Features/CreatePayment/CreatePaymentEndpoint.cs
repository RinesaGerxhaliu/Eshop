// File: Ordering/Orders/Features/CreatePayment/CreatePaymentEndpoint.cs
using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Mapster;

namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/payments/create", async (
                    CreatePaymentRequest request,  // Carter bëri binding automatikisht
                    ISender sender
                ) =>
            {
                // 1) Convert DTO në komandë
                var cmd = request.Adapt<CreatePaymentCommand>();

                // 2) Dërgo te handler-i MediatR
                var result = await sender.Send(cmd);

                // 3) Nëse gabim, kthe BadRequest
                if (!result.Success)
                {
                    return Results.BadRequest(new { error = result.ErrorMessage });
                }

                // 4) Përgatis përgjigjen
                var response = new CreatePaymentResponse
                {
                    ClientSecret = result.ClientSecret!,
                    PaymentIntentId = result.PaymentIntentId!
                };

                return Results.Ok(response);
            })
            .Accepts<CreatePaymentRequest>("application/json")
            .Produces<CreatePaymentResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithName("CreatePayment")
            .WithSummary("Creates a Stripe PaymentIntent for an order and returns its client_secret");
        }
    }
}
