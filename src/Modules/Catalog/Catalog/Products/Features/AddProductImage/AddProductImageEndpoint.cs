namespace Catalog.Products.Features.AddProductImage
{
    public record AddProductImageRequest(IFormFile File);
    public record AddProductImageResponse(Guid ImageId, string ImageUrl);

    public class AddProductImageEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products/{id}/images", async (
                    [FromRoute] Guid id,
                    [FromForm] AddProductImageRequest request,
                    ISender sender,
                    IImageService images) =>
            {
                if (request.File is null)
                {
                    return Results.BadRequest("File is required");
                }

                // Save the file and get its public URL
                var url = await images.SaveAsync(request.File.OpenReadStream(), request.File.FileName);
                // Execute the command
                var result = await sender.Send(new AddProductImageCommand(id, url));
                // Manually build the response with both ID and URL
                var response = new AddProductImageResponse(result.ImageId, url);

                return Results.Created($"/products/{id}/images/{response.ImageId}", response);
            })
                .DisableAntiforgery()                                      // no CSRF check on API file upload
                .Accepts<AddProductImageRequest>("multipart/form-data")
                .Produces<AddProductImageResponse>(StatusCodes.Status201Created)
                .ProducesProblem(StatusCodes.Status400BadRequest)
                .WithName("Add Product Image")
                .WithSummary("Add Product Image")
                .WithDescription("Uploads an image file and associates it with the specified product");
        }
    }
}
