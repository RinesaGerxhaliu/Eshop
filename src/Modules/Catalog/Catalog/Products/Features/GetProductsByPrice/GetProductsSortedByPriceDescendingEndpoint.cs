using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Catalog.Products.Features.GetProductsByPrice;

public class GetProductsSortedByPriceDescendingEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Endpoint to get products sorted by price in descending order
        app.MapGet("/products/sorted/by-price-descending", async (ISender sender) =>
        {
            // Create the query for sorted products by descending price
            var query = new GetProductsSortedByPriceQuery();
            var result = await sender.Send(query);

            return Results.Ok(result); // Return the result
        })
        .WithName("Get Products Sorted By Price Descending")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products Sorted By Price Descending")
        .WithDescription("Returns a list of products ordered from highest to lowest price. No authentication required.");
    }
}





