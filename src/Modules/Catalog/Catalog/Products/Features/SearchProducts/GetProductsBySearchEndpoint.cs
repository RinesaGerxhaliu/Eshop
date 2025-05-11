namespace Catalog.Products.Features.Search;

public class GetProductsBySearchEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/search", async (
                [FromQuery] string query,
                [FromQuery] Guid? categoryId,
                [FromQuery] decimal? minPrice,
                [FromQuery] decimal? maxPrice,
                [FromQuery] Guid? brandId,
                ISender sender
            ) =>
        {
            if (string.IsNullOrWhiteSpace(query))
                return Results.BadRequest("Query string is required.");

            var result = await sender.Send(new GetProductsBySearchQuery(query, categoryId, minPrice, maxPrice, brandId));
            return Results.Ok(result);
        })
        .WithName("Search Products")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Search products by keyword with filters")
        .WithDescription("Returns a list of products matching the search keyword with additional filtering options.");
    }

}
