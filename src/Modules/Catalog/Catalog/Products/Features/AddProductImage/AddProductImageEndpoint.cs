namespace Catalog.Products.Features.AddProductImage
{
    public record AddProductImageRequest(IFormFile file);
    public record AddProductImageResponse(Guid ImageId, string ImageUrl);
    public class AddProductImageEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/products/{id}/image", async (
                    [FromRoute] Guid id,
                    [FromForm] AddProductImageRequest request,
                    ISender sender,
                    IImageService images
                ) =>
            {
                if (request.file == null || request.file.Length == 0)
                    return Results.BadRequest("File is required");

                // persist & get URL
                var url = await images.SaveAsync(request.file.OpenReadStream(), request.file.FileName);
                var result = await sender.Send(new AddProductImageCommand(id, url));

                var response = new AddProductImageResponse(result.ImageId, url);
                return Results.Created($"/products/{id}/images/{response.ImageId}", response);
            })
            .DisableAntiforgery()                              // no CSRF check on API file upload
            .Accepts<AddProductImageRequest>("multipart/form-data")
            .WithMetadata(new ConsumesAttribute("multipart/form-data"))// for docs/OpenAPI
            .Produces<AddProductImageResponse>(201)
            .ProducesProblem(400)
            .WithName("AddProductImage")
            .WithSummary("Upload a product image")
            .WithDescription("Uploads a single image file and attaches it to the product.");
        }
    }
}
