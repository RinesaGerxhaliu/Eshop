using System.Security.Claims;

namespace Catalog.Products.Features.AddReview;

public record CreateProductReviewRequest(Guid ProductId, string ReviewText, int Rating);

public record CreateProductReviewResponse(Guid Id);

public class CreateProductReviewEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/products/reviews", async (CreateProductReviewRequest request, ISender sender, ClaimsPrincipal user) =>
        {
            var userName = user.Identity?.Name;

            if (string.IsNullOrWhiteSpace(userName))
            {
                return Results.Problem("Unauthorized: User name not found.", statusCode: StatusCodes.Status401Unauthorized);
            }

            var command = new CreateProductReviewCommand(request.ProductId, request.ReviewText, request.Rating, userName);

            var result = await sender.Send(command);

            return Results.Created($"/products/reviews/{result.Id}", result);
        })
        .Produces<CreateProductReviewResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Product Review")
        .WithDescription("Allows authenticated users to submit a review for a product.")
        .RequireAuthorization();
    }
}