using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Catalog.Products.Features.GetProductsByNameAscending;

public class GetProductsSortedByNameEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/sorted/by-name-ascending", async (ISender sender) =>
        {
            var query = new GetProductsSortedByNameQuery();
            var result = await sender.Send(query);
            return Results.Ok(result);
        })
        .WithName("Get Products Sorted By Name Ascending")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products Sorted A-Z")
        .WithDescription("Returns a list of products ordered alphabetically from A to Z.");
    }
}
