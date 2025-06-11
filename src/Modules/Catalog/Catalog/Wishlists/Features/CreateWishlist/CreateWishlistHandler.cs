using Catalog.Wishlists.DTOs;
using Catalog.Wishlists.Models;
using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.CreateWishlist;

public record CreateWishlistCommand(WishlistDTO Wishlist)
    : ICommand<CreateWishlistResult>;

public record CreateWishlistResult(Guid Id);

public class CreateWishlistCommandValidator : AbstractValidator<CreateWishlistCommand>
{
    public CreateWishlistCommandValidator()
    {
        RuleFor(x => x.Wishlist.UserName).NotEmpty().WithMessage("Username is required");
    }
}

internal class CreateWishlistHandler(IWishlistRepository repository)
    : ICommandHandler<CreateWishlistCommand, CreateWishlistResult>
{
    public async Task<CreateWishlistResult> Handle(CreateWishlistCommand command, CancellationToken cancellationToken)
    {
        // Check if a wishlist already exists for the given user
        var existingWishlist = await repository.GetByUserNameAsync(command.Wishlist.UserName, cancellationToken);

        if (existingWishlist != null)
        {
            // Optionally, you could update the existing wishlist items here
            return new CreateWishlistResult(existingWishlist.Id);
        }

        // If no wishlist exists, create a new one
        var newWishlist = CreateNewWishlist(command.Wishlist);

        await repository.CreateWishlist(newWishlist, cancellationToken);

        return new CreateWishlistResult(newWishlist.Id);
    }

    private Wishlist CreateNewWishlist(WishlistDTO wishlistDto)
    {
        var newWishlist = Wishlist.Create(
            Guid.NewGuid(),
            wishlistDto.UserName);

        if (wishlistDto.Items != null)
        {
            wishlistDto.Items.ForEach(item =>
            {
                newWishlist.AddItem(
                    item.ProductId,
                    item.PriceWhenAdded,
                    item.ProductName);
            });
        }

        return newWishlist;
    }
}
