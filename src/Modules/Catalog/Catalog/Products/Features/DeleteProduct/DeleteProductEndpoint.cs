using System.Security.Claims;

namespace Catalog.Products.Features.DeleteProduct
{

    public record DeleteProductResponse(bool isSuccessful);

    public class DeleteProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/{id}", async (
                Guid id,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                var result = await sender.Send(new DeleteProductCommand(id));
                var response = result.Adapt<DeleteProductResponse>();
                return Results.Ok(response);
            })
            .RequireAuthorization()
            .WithName("DeleteProduct")
            .Produces<DeleteProductResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status403Forbidden)
            .WithSummary("Delete Product")
            .WithDescription("Deletes a product by ID. Only accessible by admin.");
        }
    }
}
