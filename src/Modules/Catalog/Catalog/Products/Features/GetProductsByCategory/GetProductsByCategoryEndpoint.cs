using Catalog.Products.Features.GetProductsByCategory;

public class GetProductsByCategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/by-category/{categoryId:guid}", async (
            Guid categoryId,
            int PageIndex,
            int PageSize,
            ISender sender) =>
        {
            var query = new GetProductsByCategoryQuery(categoryId, PageIndex, PageSize);
            var result = await sender.Send(query);

            return Results.Ok(result);
        })
        .WithName("Get Products By Category")
        .Produces<PaginatedProductsDTO>(StatusCodes.Status200OK)
        .WithSummary("Get Products by Category with Pagination")
        .WithDescription("Returns paginated products of a category. No authentication required.");
    }
}

