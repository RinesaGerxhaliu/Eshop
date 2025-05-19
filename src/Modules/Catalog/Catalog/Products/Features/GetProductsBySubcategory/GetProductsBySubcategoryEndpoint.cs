using Catalog.Products.Features.GetProductsBySubcategory;

public class GetProductsBySubcategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/by-subcategory/{subcategoryId:guid}", async (
                Guid subcategoryId,
                ISender sender) =>
        {
            var query = new GetProductsBySubcategoryQuery(subcategoryId);
            var products = await sender.Send(query);
            return Results.Ok(products);
        })
        .WithName("Get Products By Subcategory")
        .Produces<List<ProductDTO>>(StatusCodes.Status200OK)
        .WithSummary("Get Products by Subcategory")
        .WithDescription("Returns a list of products associated with the specified subcategory. No auth required.");
    }
}