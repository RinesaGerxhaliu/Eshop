using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using MediatR;
using Carter;
using Microsoft.AspNetCore.Authorization;

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
                IImageService images,
                ClaimsPrincipal user
            ) =>
            {
                if (!user.IsInRole("admin"))
                {
                    return Results.Forbid();
                }

                if (request.file == null || request.file.Length == 0)
                {
                    return Results.BadRequest("File is required");
                }

                var url = await images.SaveAsync(request.file.OpenReadStream(), request.file.FileName);

                var result = await sender.Send(new AddProductImageCommand(id, url));

                var response = new AddProductImageResponse(result.ImageId, url);

                return Results.Created($"/products/{id}/images/{response.ImageId}", response);
            })
            .DisableAntiforgery()
            .Accepts<AddProductImageRequest>("multipart/form-data")
            .WithMetadata(new ConsumesAttribute("multipart/form-data"))
            .Produces<AddProductImageResponse>(201)
            .ProducesProblem(400)
            .Produces(StatusCodes.Status403Forbidden)  
            .WithName("AddProductImage")
            .WithSummary("Upload a product image")
            .WithDescription("Uploads a single image file and attaches it to the product.")
            .RequireAuthorization();
        }
    }
}
