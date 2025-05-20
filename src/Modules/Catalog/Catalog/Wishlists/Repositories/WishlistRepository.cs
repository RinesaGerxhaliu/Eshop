using Catalog.Wishlists.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace Catalog.Wishlists.Repositories;

public class WishlistRepository(CatalogDbContext context) : IWishlistRepository
{
    public async Task<Wishlist?> GetWishlist(string customerId, bool includeItems = true, CancellationToken cancellationToken = default)
    {
        var query = context.Wishlists.AsQueryable();

        if (includeItems)
        {
            query = query.Include(w => w.Items);
        }

        return await query.FirstOrDefaultAsync(w => w.CustomerId == customerId, cancellationToken);
    }

    public async Task CreateWishlist(Wishlist wishlist, CancellationToken cancellationToken = default)
    {
        await context.Wishlists.AddAsync(wishlist, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(string customerId, CancellationToken cancellationToken = default)
    {
        await context.SaveChangesAsync(cancellationToken);
    }
}
