using Ordering.Orders.Dtos;
using Ordering.Orders.Features.CreateShippingMethod;

namespace Ordering.Orders.Features.CreateShippingMethod;

public record CreateShippingMethodRequest(ShippingMethodDto ShippingMethod);
public record CreateShippingMethodResponse(Guid Id);

public class CreateShippingMethodEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/shipping-methods", async (CreateShippingMethodRequest request, ISender sender) =>
        {
            var command = request.Adapt<CreateShippingMethodCommand>();
            var result = await sender.Send(command);
            var response = result.Adapt<CreateShippingMethodResponse>();

            return Results.Created($"/shipping-methods/{response.Id}", response);
        })
        .WithName("CreateShippingMethod")
        .Produces<CreateShippingMethodResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Shipping Method")
        .WithDescription("Creates a new shipping method.");
    }
}
