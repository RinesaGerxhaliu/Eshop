using Catalog.Contracts.Products.Features.GetProductById;
using Catalog.Wishlists.Repositories;

namespace Catalog.Wishlists.Features.AddItemIntoWishlist;

public record AddItemIntoWishlistCommand(string CustomerId, Guid ProductId)
    : ICommand<AddItemIntoWishlistResult>;

public record AddItemIntoWishlistResult(Guid Id);

public class AddItemIntoWishlistCommandValidator : AbstractValidator<AddItemIntoWishlistCommand>
{
    public AddItemIntoWishlistCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty().WithMessage("CustomerId is required");
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
    }
}

internal class AddItemIntoWishlistHandler(IWishlistRepository repository, ISender sender)
    : ICommandHandler<AddItemIntoWishlistCommand, AddItemIntoWishlistResult>
{
    public async Task<AddItemIntoWishlistResult> Handle(AddItemIntoWishlistCommand command, CancellationToken cancellationToken)
    {
        // Get wishlist for customer
        var wishlist = await repository.GetWishlist(command.CustomerId, false, cancellationToken);

        // Get product info from catalog
        var result = await sender.Send(new GetProductByIdQuery(command.ProductId));

        // Add item to wishlist
        wishlist.AddItem(
            command.ProductId,
            result.Product.Price,
            result.Product.Name
        );

        // Save changes
        await repository.SaveChangesAsync(command.CustomerId, cancellationToken);

        return new AddItemIntoWishlistResult(wishlist.Id);
    }
}
