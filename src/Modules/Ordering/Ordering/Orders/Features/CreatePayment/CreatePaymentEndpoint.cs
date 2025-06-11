using Ordering.Orders.Features.CreatePayment;

public class CreatePaymentEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/payments/create", async (
                CreatePaymentRequest request,
                ISender sender
            ) =>
        {
            var cmd = request.Adapt<CreatePaymentCommand>();

            var result = await sender.Send(cmd);
            if (!result.Success)
                return Results.BadRequest(new { error = result.ErrorMessage });

            var response = new CreatePaymentResponse();
            if (cmd.PaymentMethod == PaymentMethodType.CashOnDelivery)
            {
                response.Message = "Order placed successfully (Cash on Delivery)";
            }
            else
            {
                response.ClientSecret = result.ClientSecret;
                response.PaymentIntentId = result.PaymentIntentId;
            }
            return Results.Ok(response);
        })
        .RequireAuthorization()
        .Accepts<CreatePaymentRequest>("application/json")
        .Produces<CreatePaymentResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);
    }
}
