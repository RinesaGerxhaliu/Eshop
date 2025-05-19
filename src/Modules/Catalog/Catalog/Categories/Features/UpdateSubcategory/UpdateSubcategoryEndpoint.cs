namespace Catalog.Categories.Features.UpdateSubcategory;

using System.Security.Claims;
using Carter;
using Catalog.Categories.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;

public record UpdateSubcategoryRequest(SubcategoryDto Subcategory);

public record UpdateSubcategoryResponse(bool IsSuccessful);

public class UpdateSubcategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/subcategories", async (
                UpdateSubcategoryRequest request,
                ISender sender,
                ClaimsPrincipal user) =>
        {
            if (!user.IsInRole("admin"))
                return Results.Forbid();

            var command = new UpdateSubcategoryCommand(request.Subcategory);
            var result = await sender.Send(command);

            if (!result.IsSuccessful)
                return Results.NotFound();

            return Results.Ok(new UpdateSubcategoryResponse(true));
        })
           .WithName("Update Subcategory")
           .Produces<UpdateSubcategoryResponse>(StatusCodes.Status200OK)
           .ProducesProblem(StatusCodes.Status400BadRequest)
           .ProducesProblem(StatusCodes.Status403Forbidden)
           .ProducesProblem(StatusCodes.Status404NotFound)
           .WithSummary("Update Subcategory (Admin only)")
           .WithDescription("Updates an existing subcategory (including reassigning its CategoryId).");
    }
}
