using System.Security.Claims;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.CreateSubcategory
{
    public record CreateSubcategoryRequest
    {
        public SubcategoryDto Subcategory { get; init; } = default!;
    }

    public record CreateSubcategoryResponse(Guid Id);

    public class CreateSubcategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/subcategories", async (
                    CreateSubcategoryRequest request,
                    ISender sender,
                    ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                    return Results.Forbid();

                var command = request.Adapt<CreateSubcategoryCommand>();
                var result = await sender.Send(command);

                var response = new CreateSubcategoryResponse(result.Id);

                return Results.Created($"/subcategories/{response.Id}", response);
            })
               .WithName("Create Subcategory")
               .Produces<CreateSubcategoryResponse>(StatusCodes.Status201Created)
               .ProducesProblem(StatusCodes.Status400BadRequest)
               .Produces(StatusCodes.Status403Forbidden)
               .WithSummary("Create Subcategory")
               .WithDescription("Creates a new product subcategory. Admin only.");
        }
    }
}
