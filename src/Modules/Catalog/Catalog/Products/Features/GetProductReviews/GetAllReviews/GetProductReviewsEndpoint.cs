using Catalog.Contracts.Review.DTOs;
using Catalog.Products.Features.GetProductReviews.GetAllReviews;

public class GetProductReviewsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Define the GET route for fetching product reviews
        app.MapGet("/products/{productId:guid}/reviews", async (Guid productId, ISender sender) =>
        {
            // Create the query for fetching reviews for a specific product
            var query = new GetProductReviewsQuery(productId);

            // Send the query to MediatR to get the result (list of reviews)
            var reviews = await sender.Send(query);

            // If reviews are found, return them, else return an empty list
            return reviews.Any()
                ? Results.Ok(reviews)
                : Results.NoContent(); // 204 No Content if no reviews are found
        })
        .WithName("Get Product Reviews")
        .Produces<List<ReviewDTO>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status204NoContent)
        .WithSummary("Get Reviews for a Product")
        .WithDescription("Fetch all reviews for a specific product, even without authentication.");
    }
}
