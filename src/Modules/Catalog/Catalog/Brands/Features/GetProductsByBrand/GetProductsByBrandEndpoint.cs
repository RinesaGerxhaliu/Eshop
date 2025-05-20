using Catalog.Brands.Features.GetProductsByBrand;
using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

public class GetProductsByBrandEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/by-brand/{brandId:guid}", async (
            Guid brandId,
            int PageIndex,
            int PageSize,
            ISender sender) =>
        {
            var query = new GetProductsByBrandQuery(brandId, PageIndex, PageSize);
            var result = await sender.Send(query);

            return Results.Ok(result);
        })
        .WithName("Get Products By Brand")
        .Produces<PaginatedProductsDTO>(StatusCodes.Status200OK)
        .WithSummary("Get Products by Brand with Pagination")
        .WithDescription("Returns paginated products of a brand. No authentication required.");
    }
}

