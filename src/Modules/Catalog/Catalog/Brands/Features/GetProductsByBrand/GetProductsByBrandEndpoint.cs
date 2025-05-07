using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Catalog.Brands.Features.GetProductsByBrand;
using Catalog.Contracts.Products;

public class GetProductsByBrandEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/by-brand/{brandId:guid}", async (
            Guid brandId,
            ISender sender) =>
        {
            var query = new GetProductsByBrandQuery(brandId);
            var result = await sender.Send(query);

            return Results.Ok(result);
        })
        .WithName("Get Products By Brand")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products by Brand")
        .WithDescription("Returns a list of products associated with a specific brand. No authentication required.");
    }
}
