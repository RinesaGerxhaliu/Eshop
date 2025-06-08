using Ordering.Orders.Dtos;
using Ordering.Orders.Features.CreateShippingMethod;
using Carter;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;

public record CreateShippingMethodRequest(ShippingMethodDto ShippingMethod);
public record CreateShippingMethodResponse(Guid Id);

public class CreateShippingMethodEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/shipping-methods", async (CreateShippingMethodRequest request, ISender sender, ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            var command = request.Adapt<CreateShippingMethodCommand>();
            var result = await sender.Send(command);
            var response = result.Adapt<CreateShippingMethodResponse>();

            return Results.Created($"/shipping-methods/{response.Id}", response);
        })
        .RequireAuthorization()  
        .WithName("CreateShippingMethod")
        .Produces<CreateShippingMethodResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status403Forbidden) 
        .WithSummary("Create Shipping Method")
        .WithDescription("Creates a new shipping method, accessible only by admin.");
    }
}
