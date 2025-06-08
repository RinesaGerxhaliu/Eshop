using Catalog.Contracts.Review.DTOs;
using Catalog.Products.Features.GetProductReviews.GetAllReviews;

public class GetProductReviewsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products/{productId:guid}/reviews", async (Guid productId, ISender sender) =>
        {
            var query = new GetProductReviewsQuery(productId);

            var reviews = await sender.Send(query);

            return reviews.Any()
                ? Results.Ok(reviews)
                : Results.NoContent();
        })
        .WithName("Get Product Reviews")
        .Produces<List<ReviewDTO>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status204NoContent)
        .WithSummary("Get Reviews for a Product")
        .WithDescription("Fetch all reviews for a specific product, even without authentication.");
    }
}
