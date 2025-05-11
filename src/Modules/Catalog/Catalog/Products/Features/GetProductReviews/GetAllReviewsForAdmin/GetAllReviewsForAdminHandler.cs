using Catalog.Contracts.Review.DTOs;
using Shared.Pagination;

namespace Catalog.Products.Features.GetAllReviews
{
    public record GetAllReviewsQuery(
        PaginationRequest PaginationRequest,
        Guid? ProductId
    ) : IQuery<GetAllReviewsResult>;

    public record GetAllReviewsResult(
        PaginatedResult<ReviewDTO> Reviews
    );

    internal class GetAllReviewsHandler
        : IQueryHandler<GetAllReviewsQuery, GetAllReviewsResult>
    {
        private readonly IProductReviewRepository _repo;

        public GetAllReviewsHandler(IProductReviewRepository repo)
            => _repo = repo;

        public async Task<GetAllReviewsResult> Handle(
            GetAllReviewsQuery q,
            CancellationToken ct
        )
        {
            var page = await _repo.GetAllReviewsAsync(
                q.PaginationRequest,
                q.ProductId,
                ct
            );


            var dtoItems = page.Data.Adapt<List<ReviewDTO>>();

            var dtoPage = new PaginatedResult<ReviewDTO>(
                page.PageIndex,
                page.PageSize,
                page.Count,    
                dtoItems       
            );

            return new GetAllReviewsResult(dtoPage);
        }
    }
}
