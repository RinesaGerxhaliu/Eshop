using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Catalog.Products.Features.GetProducts;

public class GetNewestProductsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/newest", async (ISender sender) =>
        {
            var result = await sender.Send(new GetNewestProductsQuery());
            return Results.Ok(result);
        })
        .RequireAuthorization() 
        .WithName("GetNewestProducts")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get 4 newest products")
        .WithDescription("Returns the 4 most recently added products based on CreatedAt.");
    }
}
