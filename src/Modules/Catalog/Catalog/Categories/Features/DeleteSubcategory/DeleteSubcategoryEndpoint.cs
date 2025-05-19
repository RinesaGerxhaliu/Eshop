using System.Security.Claims;

namespace Catalog.Categories.Features.DeleteSubcategory
{
    public record DeleteSubcategoryResponse(bool IsSuccessful);

    public class DeleteSubcategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/subcategories/{id:guid}", async (
                    Guid id,
                    ISender sender,
                    ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                    return Results.Forbid();

                var result = await sender.Send(new DeleteSubcategoryCommand(id));
                var response = result.Adapt<DeleteSubcategoryResponse>();

                return Results.Ok(response);
            })
               .WithName("Delete Subcategory")
               .Produces<DeleteSubcategoryResponse>(StatusCodes.Status200OK)
               .Produces(StatusCodes.Status403Forbidden)
               .ProducesProblem(StatusCodes.Status400BadRequest)
               .ProducesProblem(StatusCodes.Status404NotFound)
               .WithSummary("Delete Subcategory")
               .WithDescription("Deletes a product subcategory by Id. Admin only.");
        }
    }
}
