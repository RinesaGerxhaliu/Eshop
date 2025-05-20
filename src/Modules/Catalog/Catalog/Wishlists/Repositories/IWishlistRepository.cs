using Catalog.Wishlists.Models;

namespace Catalog.Wishlists.Repositories;

public interface IWishlistRepository
{
    Task<Wishlist?> GetWishlist(string customerId, bool includeItems = true, CancellationToken cancellationToken = default);
    Task CreateWishlist(Wishlist wishlist, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(string customerId, CancellationToken cancellationToken = default);
}
