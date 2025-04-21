using Microsoft.AspNetCore.Http;
using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.GetBrands
{
    public record GetBrandsResponse(List<BrandDTO> Brands);

    public class GetBrandsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/brands", async (ISender sender) =>
            {
                var result = await sender.Send(new GetBrandsQuery());

                var response = result.Adapt<GetBrandsResponse>();

                return Results.Ok(response);
            })
            .WithName("Get Brands")
            .Produces<GetBrandsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Brands")
            .WithDescription("Get all brands without pagination.");
        }
    }
}
