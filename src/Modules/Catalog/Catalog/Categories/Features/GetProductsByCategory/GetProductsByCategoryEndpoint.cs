using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Catalog.Categories.Features.GetProductsByCategory;
using Catalog.Contracts.Products;

public class GetProductsByCategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/by-category/{categoryId:guid}", async (
            Guid categoryId,
            ISender sender) =>
        {
            var query = new GetProductsByCategoryQuery(categoryId);
            var result = await sender.Send(query);

            return Results.Ok(result);
        })
        .WithName("Get Products By Category")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products by Category")
        .WithDescription("Returns a list of products associated with a specific category. No authentication required.");
    }
}

