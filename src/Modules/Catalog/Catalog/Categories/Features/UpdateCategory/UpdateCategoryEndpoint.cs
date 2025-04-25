using Catalog.Categories.DTOs;
using System.Security.Claims;

namespace Catalog.Categories.Features.UpdateCategory
{
    public class UpdateCategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/categories/{id}", async (
                Guid id,
                UpdateCategoryRequest request,
                ISender sender,
                ClaimsPrincipal user) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid(); 
                }

                var categoryDto = new CategoryDTO
                {
                    Id = id,
                    Name = request.Name
                };

                var command = new UpdateCategoryCommand(categoryDto);
                var result = await sender.Send(command);
                var response = new UpdateCategoryResponse(result.IsSuccessful);

                return Results.Ok(response);
            })
            .WithName("Update Category")
            .Produces<UpdateCategoryResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status403Forbidden) 
            .WithSummary("Update Category")
            .WithDescription("Update an existing category. Only accessible by admin.");
        }
    }
}
