using Microsoft.AspNetCore.Http;
using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.GetBrandById
{
    public record GetBrandByIdResponse(BrandDTO Brand);

    public class GetBrandByIdEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/brands/{id}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new GetBrandByIdQuery(id));

                var response = result.Adapt<GetBrandByIdResponse>();

                return Results.Ok(response);
            })
            .WithName("Get Brand By Id")
            .Produces<GetBrandByIdResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Brand By Id")
            .WithDescription("Get Brand By Id");
        }
    }
}
