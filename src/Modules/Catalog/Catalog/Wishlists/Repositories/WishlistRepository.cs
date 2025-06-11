using Catalog.Wishlists.Models;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using System;

namespace Catalog.Wishlists.Repositories;

public class WishlistRepository(CatalogDbContext context) : IWishlistRepository
{
    public async Task<Wishlist?> GetWishlist(string userName, bool includeItems = true, CancellationToken cancellationToken = default)
    {
        var query = context.Wishlists.AsQueryable();

        if (includeItems)
        {
            query = query.Include(w => w.Items);
        }

        return await query.FirstOrDefaultAsync(w => w.UserName == userName, cancellationToken);
    }
    public async Task<Wishlist?> GetByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        return await context.Wishlists
            .Include(w => w.Items) // optional: include related items
            .FirstOrDefaultAsync(w => w.UserName == userName, cancellationToken);
    }
    public async Task CreateWishlist(Wishlist wishlist, CancellationToken cancellationToken = default)
    {
        await context.Wishlists.AddAsync(wishlist, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
    public async Task<int> SaveChangesAsync(string? userName = null, CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }
}
