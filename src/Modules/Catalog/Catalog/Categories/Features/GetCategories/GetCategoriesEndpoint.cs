using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetCategories
{
    public record GetCategoriesResponse(PaginatedResult<CategoryDTO> Categories);

    public class GetCategoriesEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/categories", async (
                [AsParameters] PaginationRequest pagination,
                ISender sender
            ) =>
            {
                var result = await sender.Send(new GetCategoriesQuery(pagination));
                var response = new GetCategoriesResponse(result.Categories);
                return Results.Ok(response);
            })
            .WithName("Get Categories")
            .Produces<GetCategoriesResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Categories")
            .WithDescription("Get paginated list of categories.");
        }
    }
}
