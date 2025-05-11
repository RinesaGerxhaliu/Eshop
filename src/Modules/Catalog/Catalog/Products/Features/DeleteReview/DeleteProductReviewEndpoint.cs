using System.Security.Claims;

namespace Catalog.Products.Features.DeleteReview
{
    public class DeleteProductReviewEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/products/reviews/{reviewId:guid}", async (
                    Guid reviewId,
                    ISender sender,
                    IProductReviewRepository repo,
                    ClaimsPrincipal user,
                    CancellationToken ct
                ) =>
            {
                if (!(user.Identity?.IsAuthenticated ?? false))
                    return Results.Unauthorized();

                var review = await repo.GetReviewById(reviewId, ct);
                if (review is null)
                    return Results.NotFound();

                // get the current user's identifier and username
                var currentUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? user.FindFirstValue("sub");
                var currentUserName = user.Identity?.Name
                                   ?? user.FindFirstValue(ClaimTypes.Email)
                                   ?? user.FindFirstValue("preferred_username")
                                   ?? "";

                if (!user.IsInRole("admin") &&
                    review.ReviewerUserId.ToString() != currentUserId)
                {
                    return Results.Forbid();
                }

                // pass both the reviewId and the currentUserName to the command
                await sender.Send(
                    new DeleteProductReviewCommand(reviewId, currentUserName),
                    ct
                );

                return Results.NoContent();
            })
            .WithName("Delete Product Review")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .RequireAuthorization();
        }
    }
}
