using Shared.Pagination;

namespace Catalog.Products.Features.GetProducts
{
    public record GetProductsResponse(PaginatedResult<ProductDTO> Products);

    public class GetProductsEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/products", async (
                    [AsParameters] PaginationRequest pagination,
                    Guid? categoryId,
                    Guid? brandId,
                    ISender sender
                ) =>
            {
                var result = await sender.Send(new GetProductsQuery(pagination, categoryId, brandId));
                var response = new GetProductsResponse(result.Products);
                return Results.Ok(response);
            })
            .WithName("Get Products")
            .Produces<GetProductsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Get Products (optional CategoryId & BrandId)")
            .WithDescription("Returns a paged list of products, optionally filtered by category and/or brand.");
        }
    }
}
