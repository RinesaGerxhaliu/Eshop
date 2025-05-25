using Ordering.Orders.Dtos;

namespace Ordering.Orders.Features.UpdateShippingMethod;

public record UpdateShippingMethodRequest(string Name, decimal Cost);

public class UpdateShippingMethodEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/shipping-methods/{id:guid}", async (Guid id, UpdateShippingMethodRequest request, ISender sender) =>
        {
            var command = new UpdateShippingMethodCommand(id, request.Name, request.Cost);
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .WithName("UpdateShippingMethod")
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Update a shipping method")
        .WithDescription("Updates name and cost of an existing shipping method.");
    }
}
