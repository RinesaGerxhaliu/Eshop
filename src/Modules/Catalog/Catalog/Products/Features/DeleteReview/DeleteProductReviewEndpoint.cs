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

                var isAdmin = user.IsInRole("admin");

                var currentUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                                    ?? user.FindFirstValue("sub");


                if (!isAdmin && review.ReviewerUserId.ToString() != currentUserId)
                {
                    return Results.Forbid();
                }

                var currentUserName = user.Identity?.Name
                                      ?? user.FindFirstValue(ClaimTypes.Email)
                                      ?? user.FindFirstValue("preferred_username")
                                      ?? "";

                await sender.Send(new DeleteProductReviewCommand(reviewId, currentUserName), ct);

                return Results.NoContent();
            })
              .RequireAuthorization()
              .WithName("DeleteProductReview")
              .Produces(StatusCodes.Status204NoContent)
              .ProducesProblem(StatusCodes.Status401Unauthorized)
              .ProducesProblem(StatusCodes.Status403Forbidden)
              .ProducesProblem(StatusCodes.Status404NotFound);
        }
    }
}
