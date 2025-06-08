using System.Security.Claims;
using Ordering.Orders.Dtos;
using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Ordering.Orders.Features.UpdateShippingMethod;

public record UpdateShippingMethodRequest(string Name, decimal Cost);

public class UpdateShippingMethodEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/shipping-methods/{id:guid}", async (
            Guid id,
            UpdateShippingMethodRequest request,
            ISender sender,
            ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            var command = new UpdateShippingMethodCommand(id, request.Name, request.Cost);
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithName("UpdateShippingMethod")
        .Produces(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status403Forbidden)
        .WithSummary("Update a shipping method")
        .WithDescription("Updates name and cost of an existing shipping method, accessible only by admin.");
    }
}
