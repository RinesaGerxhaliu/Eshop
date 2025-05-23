using Catalog.Wishlists.DTOs;
using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.GetWishlist;

public record GetWishlistQuery(string CustomerId)
    : IQuery<GetWishlistResult>;

public record GetWishlistResult(WishlistDTO Wishlist);

internal class GetWishlistHandler(IWishlistRepository repository, ISender sender)
    : IQueryHandler<GetWishlistQuery, GetWishlistResult>
{
    public async Task<GetWishlistResult> Handle(GetWishlistQuery query, CancellationToken cancellationToken)
    {
        // Get the wishlist
        var wishlist = await repository.GetWishlist(query.CustomerId, true, cancellationToken);

        // Build live-updated WishlistItemDTOs
        var updatedItems = new List<WishlistItemDTO>();

        foreach (var item in wishlist.Items)
        {
            var productResult = await sender.Send(new GetProductByIdQuery(item.ProductId));

            var updatedItem = new WishlistItemDTO(
                Id: item.Id,
                WishlistId: item.WishlistId,
                ProductId: item.ProductId,
                PriceWhenAdded: productResult.Product.Price, // you could also choose to keep the original price if needed
                ProductName: productResult.Product.Name
            );

            updatedItems.Add(updatedItem);
        }

        var wishlistDto = new WishlistDTO(
            Id: wishlist.Id,
            UserName: wishlist.UserName,
            Items: updatedItems
        );

        return new GetWishlistResult(wishlistDto);
    }
}

