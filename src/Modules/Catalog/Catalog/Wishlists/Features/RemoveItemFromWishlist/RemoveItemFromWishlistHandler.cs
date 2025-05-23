using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.RemoveItemFromWishlist;

public record RemoveItemFromWishlistCommand(string UserName, Guid ProductId)
    : ICommand<RemoveItemFromWishlistResult>;

public record RemoveItemFromWishlistResult(Guid Id);

public class RemoveItemFromWishlistCommandValidator : AbstractValidator<RemoveItemFromWishlistCommand>
{
    public RemoveItemFromWishlistCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}

internal class RemoveItemFromWishlistHandler(IWishlistRepository repository)
    : ICommandHandler<RemoveItemFromWishlistCommand, RemoveItemFromWishlistResult>
{
    public async Task<RemoveItemFromWishlistResult> Handle(RemoveItemFromWishlistCommand command, CancellationToken cancellationToken)
    {
        var wishlist = await repository.GetWishlist(command.UserName, false, cancellationToken);

        wishlist.RemoveItem(command.ProductId);

        await repository.SaveChangesAsync(command.UserName, cancellationToken);

        return new RemoveItemFromWishlistResult(wishlist.Id);
    }
}

