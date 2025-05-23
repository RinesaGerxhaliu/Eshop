using Catalog.Contracts.Products.Features.GetProductById;
using Catalog.Wishlists.DTOs;
using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.AddItemIntoWishlist;

public record AddItemIntoWishlistCommand(string UserName, WishlistItemDTO WishlistItem)
    : ICommand<AddItemIntoWishlistResult>;

public record AddItemIntoWishlistResult(Guid Id);

public class AddItemIntoWishlistCommandValidator : AbstractValidator<AddItemIntoWishlistCommand>
{
    public AddItemIntoWishlistCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
        RuleFor(x => x.WishlistItem.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}

internal class AddItemIntoWishlistHandler(IWishlistRepository repository, ISender sender)
    : ICommandHandler<AddItemIntoWishlistCommand, AddItemIntoWishlistResult>
{
    public async Task<AddItemIntoWishlistResult> Handle(AddItemIntoWishlistCommand command, CancellationToken cancellationToken)
    {
        // Get wishlist for customer
        var wishlist = await repository.GetWishlist(command.UserName, false, cancellationToken);

        // Get product info from catalog
        var result = await sender.Send(new GetProductByIdQuery(command.WishlistItem.ProductId));

        // Add item to wishlist
        wishlist.AddItem(
            command.WishlistItem.ProductId,
            result.Product.Price,
            result.Product.Name);

        // Save changes
        await repository.SaveChangesAsync(command.UserName, cancellationToken);

        return new AddItemIntoWishlistResult(wishlist.Id);
    }
}
