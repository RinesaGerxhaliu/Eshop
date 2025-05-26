using Catalog.Wishlists.DTOs;
using Catalog.Wishlists.Repositories;
using Shared.Exceptions;

namespace Catalog.Wishlists.Features.GetWishlist;

public record GetWishlistQuery(string CustomerId)
    : IQuery<GetWishlistResult>;

public record GetWishlistResult(WishlistDTO Wishlist);

internal class GetWishlistHandler(IWishlistRepository repository, ISender sender)
    : IQueryHandler<GetWishlistQuery, GetWishlistResult>
{
    public async Task<GetWishlistResult> Handle(GetWishlistQuery query, CancellationToken cancellationToken)
    {
        var wishlist = await repository.GetWishlist(query.CustomerId, true, cancellationToken);

        if (wishlist == null)
        {
            throw new NotFoundException($"Wishlist for user '{query.CustomerId}' not found.");
        }

        var updatedItems = new List<WishlistItemDTO>();

        foreach (var item in wishlist.Items)
        {
            var productResult = await sender.Send(new GetProductByIdQuery(item.ProductId));

            var updatedItem = new WishlistItemDTO(
                Id: item.Id,
                WishlistId: item.WishlistId,
                ProductId: item.ProductId,
                PriceWhenAdded: productResult.Product.Price,
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

