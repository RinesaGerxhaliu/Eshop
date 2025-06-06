using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Threading.Tasks;

namespace Ordering.Orders.Features.CreatePayment
{
    public class CreatePaymentEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/payments/create", async (
                    CreatePaymentRequest request,
                    ISender sender
                ) =>
            {
                // Map the incoming request DTO to your MediatR command:
                var cmd = new CreatePaymentCommand(request.OrderId, request.CurrencyCode);

                // Dispatch the command:
                var result = await sender.Send(cmd);

                // If something went wrong (e.g. order not found, Stripe error), return 400 with an error message:
                if (!result.Success)
                {
                    return Results.BadRequest(new { error = result.ErrorMessage });
                }

                // Otherwise, build and return the 200 response containing ClientSecret + PaymentIntentId:
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
