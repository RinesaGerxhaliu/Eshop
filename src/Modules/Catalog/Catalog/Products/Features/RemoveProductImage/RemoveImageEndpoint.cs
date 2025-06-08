using System.Security.Claims;

namespace Catalog.Products.Features.RemoveProductImage
{
    internal class RemoveImageEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/{productId}/images/{imageId}", async (
                [FromRoute] Guid productId,
                [FromRoute] Guid imageId,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                var command = new RemoveProductImageCommand(productId, imageId);
                var success = await sender.Send(command);

                if (!success)
                {
                    return Results.NotFound($"Image with ID {imageId} not found for product {productId}");
                }

                return Results.NoContent(); 
            })
            .RequireAuthorization()
            .WithName("RemoveProductImage")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status403Forbidden)
            .WithSummary("Remove Product Image")
            .WithDescription("Removes a specific image from a product. Only accessible by admin.");
        }
    }
}
