using Catalog.Wishlists.DTOs;
using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.GetWishlist;

public record GetWishlistQuery(string CustomerId)
    : IQuery<GetWishlistResult>;

public record GetWishlistResult(WishlistDTO Wishlist);

internal class GetWishlistHandler(IWishlistRepository repository)
    : IQueryHandler<GetWishlistQuery, GetWishlistResult>
{
    public async Task<GetWishlistResult> Handle(GetWishlistQuery query, CancellationToken cancellationToken)
    {
        // get wishlist with customerId
        var wishlist = await repository.GetWishlist(query.CustomerId, true, cancellationToken);

        // mapping wishlist entity to DTO
        var wishlistDto = wishlist.Adapt<WishlistDTO>();

        return new GetWishlistResult(wishlistDto);
    }
}

