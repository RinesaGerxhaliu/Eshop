using Catalog.Wishlists.Models;

namespace Catalog.Wishlists.Repositories;

public interface IWishlistRepository
{
    Task<Wishlist?> GetWishlist(string userName, bool includeItems = true, CancellationToken cancellationToken = default);
    Task CreateWishlist(Wishlist wishlist, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(string? userName = null, CancellationToken cancellationToken = default);
}
