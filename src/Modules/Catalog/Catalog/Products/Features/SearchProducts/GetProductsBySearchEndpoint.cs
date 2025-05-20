using Shared.Pagination;

namespace Catalog.Products.Features.Search;

public class GetProductsBySearchEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/search", async (
                [FromQuery] string query,
                  [AsParameters] PaginationRequest pagination,
                [FromQuery] Guid? categoryId,
                [FromQuery] decimal? minPrice,
                [FromQuery] decimal? maxPrice,
                [FromQuery] Guid? brandId,
                ISender sender
            ) =>
        {
            if (string.IsNullOrWhiteSpace(query))
                return Results.BadRequest("Query string is required.");

            var result = await sender.Send(new GetProductsBySearchQuery(query, pagination, categoryId, minPrice, maxPrice, brandId));
            return Results.Ok(result);
        })
        .WithName("Search Products")
        .Produces<PaginatedResult<ProductDTO>>(StatusCodes.Status200OK) // Ndryshuar
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Search products by keyword with pagination and filters")
        .WithDescription("Returns a paged list of products matching the search keyword with filters.");
    }
}
