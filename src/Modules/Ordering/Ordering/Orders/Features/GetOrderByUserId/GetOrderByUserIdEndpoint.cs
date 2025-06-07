namespace Ordering.Orders.Features.GetOrderByUserId;

public record GetUserOrdersResponse(List<UserOrderDto> Orders);

public class GetUserOrdersEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/users/{customerId}/orders", async (Guid customerId, ISender sender) =>
        {
            var result = await sender.Send(new GetUserOrdersQuery(customerId));

            var response = result.Adapt<GetUserOrdersResponse>();

            return Results.Ok(response);
        })
        .WithName("GetUserOrders")
        .Produces<GetUserOrdersResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get User Orders")
        .WithDescription("Returns a user's orders including total and items.");
    }
}

