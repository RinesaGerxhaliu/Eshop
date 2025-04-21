using System.Security.Claims;

namespace Catalog.Products.Features.UpdateReview;

public record UpdateProductReviewRequest(string NewReviewText, int NewRating);

public record UpdateProductReviewResponse(Guid Id);

public class UpdateProductReviewEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/products/reviews/{reviewId:guid}", async (Guid reviewId, UpdateProductReviewRequest request, ISender sender, ClaimsPrincipal user) =>
        {
            var userName = user.FindFirst("preferred_username")?.Value;

            if (string.IsNullOrWhiteSpace(userName))
            {
                return Results.Problem("Unauthorized: User name not found.", statusCode: StatusCodes.Status401Unauthorized);
            }

            var command = new UpdateProductReviewCommand(
                reviewId,
                request.NewReviewText,
                request.NewRating,
                userName
            );

            var result = await sender.Send(command);

            return Results.Ok(result);
        })
        .Produces<UpdateProductReviewResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Update Product Review")
        .WithDescription("Allows authenticated users to update their own product review.")
        .RequireAuthorization();
    }
}
