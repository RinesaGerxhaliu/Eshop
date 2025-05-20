using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Shared.Pagination;
using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.GetBrands
{
    public record GetBrandsResponse(PaginatedResult<BrandDTO> Brands);

    public class GetBrandsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/brands", async (
                [AsParameters] PaginationRequest pagination,
                ISender sender
            ) =>
            {
                var result = await sender.Send(new GetBrandsQuery(pagination));
                var response = new GetBrandsResponse(result.Brands);
                return Results.Ok(response);
            })
            .WithName("Get Brands")
            .Produces<GetBrandsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Get Brands")
            .WithDescription("Get paginated list of brands.");
        }
    }
}
