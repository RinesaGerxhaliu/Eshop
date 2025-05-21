using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.RemoveItemFromWishlist;

public record RemoveItemFromWishlistCommand(string CustomerId, Guid ProductId)
    : ICommand<RemoveItemFromWishlistResult>;

public record RemoveItemFromWishlistResult(Guid Id);

public class RemoveItemFromWishlistCommandValidator : AbstractValidator<RemoveItemFromWishlistCommand>
{
    public RemoveItemFromWishlistCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty().WithMessage("CustomerId is required");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}

internal class RemoveItemFromWishlistHandler(IWishlistRepository repository)
    : ICommandHandler<RemoveItemFromWishlistCommand, RemoveItemFromWishlistResult>
{
    public async Task<RemoveItemFromWishlistResult> Handle(RemoveItemFromWishlistCommand command, CancellationToken cancellationToken)
    {
        var wishlist = await repository.GetWishlist(command.CustomerId, false, cancellationToken);

        wishlist.RemoveItem(command.ProductId);

        await repository.SaveChangesAsync(command.CustomerId, cancellationToken);

        return new RemoveItemFromWishlistResult(wishlist.Id);
    }
}

