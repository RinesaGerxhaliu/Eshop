namespace Catalog.Categories.Features.GetSubcategoryById;
using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Catalog.Categories.DTOs;

public record GetSubcategoryByIdRequest(Guid Id);

public record GetSubcategoryByIdResponse(SubcategoryDto Subcategory);

public class GetSubcategoryByIdEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/subcategories/{id:guid}", async (
                [AsParameters] GetSubcategoryByIdRequest req,
                ISender sender,
                ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("admin"))
                return Results.Forbid();

            var result = await sender.Send(new GetSubcategoryByIdQuery(req.Id));
            if (result is null)
                return Results.NotFound();

            return Results.Ok(new GetSubcategoryByIdResponse(result.Subcategory));
        })
        .WithName("Get Subcategory By Id (Admin only)")
        .Produces<GetSubcategoryByIdResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status403Forbidden)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Fetch a single subcategory by its ID (admin only)")
        .WithDescription("Requires admin role. Returns 404 if not found.");
    }
}
