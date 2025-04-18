﻿namespace Catalog.Reviews.Models
{
    public class ProductReview : Entity<Guid>
    {
        public Guid ProductId { get; private set; }
        public string ReviewerUserName { get; private set; } = default!;
        public string ReviewText { get; private set; } = default!;
        public int Rating { get; private set; }

        public static ProductReview Create(Guid id, Guid productId, string reviewerUserName, string reviewText, int rating)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(reviewerUserName, nameof(reviewerUserName));
            ArgumentException.ThrowIfNullOrWhiteSpace(reviewText, nameof(reviewText));

            if (rating is < 1 or > 5)
                throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

            return new ProductReview
            {
                Id = id,
                ProductId = productId,
                ReviewerUserName = reviewerUserName,
                ReviewText = reviewText,
                Rating = rating
            };
        }
    }

}
