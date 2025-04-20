namespace Catalog.Products.Features.RemoveProductImage
{
    internal class RemoveImageEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/{productId}/images/{imageId}", async (
                    [FromRoute] Guid productId,
                    [FromRoute] Guid imageId,
                    ISender sender) =>
            {
                var command = new RemoveProductImageCommand(productId, imageId);
                var success = await sender.Send(command);

                if (!success)
                {
                    return Results.NotFound($"Image with ID {imageId} not found for product {productId}");
                }

                return Results.NoContent(); 
            })
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithName("Remove Product Image")
            .WithSummary("Remove Product Image")
            .WithDescription("Removes a specific image from a product.");
        }
    }
}
