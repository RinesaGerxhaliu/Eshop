using Microsoft.EntityFrameworkCore.Query.Internal;
using System.Security.Claims;

namespace Catalog.Products.Features.AddReview;

public record CreateProductReviewRequest(Guid ProductId, string ReviewText, int Rating, Guid ReviewerUserId);

public record CreateProductReviewResponse(Guid Id);

public class CreateProductReviewEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/products/reviews", async (CreateProductReviewRequest request, ISender sender, ClaimsPrincipal user) =>
        {
            // Retrieve the user ID from the JWT claims
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Results.Problem("Unauthorized: User ID not found.", statusCode: StatusCodes.Status401Unauthorized);
            }

            // Convert the userId to Guid
            if (!Guid.TryParse(userId, out var reviewerUserId))
            {
                return Results.Problem("Invalid User ID.", statusCode: StatusCodes.Status400BadRequest);
            }

            // Now create the command with the ReviewerUserId
            var command = new CreateProductReviewCommand(
                request.ProductId,
                reviewerUserId, // <-- This is the ReviewerUserId
                request.ReviewText,
                request.Rating,
                user.FindFirst("preferred_username")?.Value
            );

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
