using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Catalog.Products.Features.CreateProduct
{
    public record CreateProductRequest
    {
        [Required]
        public ProductDTO Product { get; init; } = default!;
    }

    public record CreateProductResponse(Guid Id);

    public class CreateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products", async (
                CreateProductRequest request,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                var command = request.Adapt<CreateProductCommand>();
                var result = await sender.Send(command);
                var response = result.Adapt<CreateProductResponse>();

                return Results.Created($"/products/{response.Id}", response);
            })
            .WithName("CreateProduct")
            .Produces<CreateProductResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status403Forbidden)
            .WithSummary("Create Product")
            .WithDescription("Creates a new product. Only accessible by admin.");
        }
    }
}
