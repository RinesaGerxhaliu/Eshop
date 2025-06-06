namespace Ordering.Orders.Features.CreateOrder;

public class CreateOrderEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/orders", async (CreateOrderRequest request, ISender sender) =>
        {
            // 1) Map DTO → Command:
            var command = request.Adapt<CreateOrderCommand>();

            // 2) Thërrit handler‐in
            var result = await sender.Send(command);

            // 3) Përpiloj CreateOrderResponse me të katër fushat
            var response = new CreateOrderResponse(
                Id: result.Id,
                Subtotal: result.Subtotal,
                ShippingCost: result.ShippingCost,
                Total: result.Total
            );

            // 4) Kthe 201 Created me response JSON
            return Results.Created($"/orders/{result.Id}", response);
        })
        .Accepts<CreateOrderRequest>("application/json")
        .Produces<CreateOrderResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithName("CreateOrder")
        .WithSummary("Create a new order");


    }
}
