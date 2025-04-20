using Microsoft.AspNetCore.Http;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetCategories
{
    public record GetCategoriesResponse(List<CategoryDTO> Categories);

    public class GetCategoriesEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/categories", async (ISender sender) =>
            {
                var result = await sender.Send(new GetCategoriesQuery());

                var response = result.Adapt<GetCategoriesResponse>();

                return Results.Ok(response);
            })
            .WithName("Get Categories")
            .Produces<GetCategoriesResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Categories")
            .WithDescription("Get all categories without pagination.");
        }
    }
}
