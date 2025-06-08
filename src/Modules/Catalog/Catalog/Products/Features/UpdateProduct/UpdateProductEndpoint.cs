using System.Security.Claims;

namespace Catalog.Products.Features.UpdateProduct
{
    public record UpdateProductRequest
    {
        public ProductDTO Product { get; init; } = default!;
    }
    public record UpdateProductResponse(bool isSuccessful);

    public class UpdateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/products", async (
                UpdateProductRequest request,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                var command = request.Adapt<UpdateProductCommand>();

                var result = await sender.Send(command);

                var response = result.Adapt<UpdateProductResponse>();

                return Results.Ok(response);
            })
            .RequireAuthorization()
            .WithName("UpdateProduct")
            .Produces<UpdateProductResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status403Forbidden)
            .WithSummary("Update Product")
            .WithDescription("Updates a product. Only accessible by admin.");
        }
    }
}