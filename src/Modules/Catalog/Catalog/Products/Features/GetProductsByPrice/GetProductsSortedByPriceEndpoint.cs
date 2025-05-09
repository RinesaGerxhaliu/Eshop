using Carter;
using Catalog.Contracts.Products;
using Catalog.Products.Features.GetProductsByPrice;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Catalog.Products.Features.GetProductsByPrice;

public class GetProductsSortedByPriceEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/sorted/by-price", async (ISender sender) =>
        {
            var query = new GetProductsSortedByPriceQuery();
            var result = await sender.Send(query);

            return Results.Ok(result);
        })
        .WithName("Get Products Sorted By Price")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products Sorted By Price")
        .WithDescription("Returns a list of products ordered from lowest to highest price. No authentication required.");
    }
}






