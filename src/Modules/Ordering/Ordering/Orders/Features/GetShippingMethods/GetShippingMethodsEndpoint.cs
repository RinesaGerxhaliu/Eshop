namespace Ordering.Orders.Features.GetShippingMethods;

public class GetShippingMethodsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/shipping-methods", async (ISender sender) =>
        {
            var result = await sender.Send(new GetShippingMethodsQuery());
            return Results.Ok(result);
        })
        .WithName("GetShippingMethods")
        .Produces<List<ShippingMethodDto>>(StatusCodes.Status200OK)
        .WithSummary("Get all shipping methods")
        .WithDescription("Returns a list of available shipping methods.");
    }
}
