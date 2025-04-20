using Microsoft.AspNetCore.Http;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetCategoryById
{
    public record GetCategoryByIdResponse(CategoryDTO Category);

    public class GetCategoryByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/categories/{id}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetCategoryByIdQuery(id));

                var response = result.Adapt<GetCategoryByIdResponse>();

                return Results.Ok(response);
            })
            .WithName("Get Category By Id")
            .Produces<GetCategoryByIdResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Category By Id")
            .WithDescription("Get Category By Id");
        }
    }
}
