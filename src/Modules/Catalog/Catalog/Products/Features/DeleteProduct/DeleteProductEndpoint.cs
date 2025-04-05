namespace Catalog.Products.Features.DeleteProduct
{
    //public record DeleteProductRequest(Guid id);
    //Not needed in this case because the id of the product is obtained from the url parameter
    public record DeleteProductResponse(bool isSuccessful);

    public class DeleteProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/{id}", async (Guid id, ISender sender) =>
            {

                var result = await sender.Send(new DeleteProductCommand(id));

                var response = result.Adapt<DeleteProductResponse>();

                return Results.Ok(response);
            })
                .WithName("Delete Product")
                .Produces<DeleteProductResponse>(StatusCodes.Status200OK)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status404NotFound)
                .WithSummary("Delete Product")
                .WithDescription("Delete Product");
        }
    }
}
