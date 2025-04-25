using System.Security.Claims;

namespace Catalog.Brands.Features.DeleteBrand
{
    public class DeleteBrandEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/brands/{id}", async (Guid id, ISender sender, ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                var result = await sender.Send(new DeleteBrandCommand(id));
                var response = new DeleteBrandResult(result.IsSuccessful);

                return Results.Ok(response);
            })
            .WithName("Delete Brand")
            .Produces<DeleteBrandResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status403Forbidden) 
            .WithSummary("Delete Brand")
            .WithDescription("Deletes a brand by its ID. Only accessible by admin.");
        }
    }
}
