namespace Catalog.Products.Features.Search;

public class GetProductsBySearchEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/search", async (
                [FromQuery] string query,
                ISender sender
            ) =>
        {
            if (string.IsNullOrWhiteSpace(query))
                return Results.BadRequest("Query string is required.");

            var result = await sender.Send(new GetProductsBySearchQuery(query));
            return Results.Ok(result);
        })
        .WithName("Search Products")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Search products by keyword")
        .WithDescription("Returns a list of products matching the given search keyword.");
    }
}
