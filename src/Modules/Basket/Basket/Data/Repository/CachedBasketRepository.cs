namespace Basket.Data.Repository;
public class CachedBasketRepository (IBasketRepository repository)
    : IBasketRepository
{

    public async Task<ShoppingCart> GetBasket(string userName, bool asNoTracking = true, CancellationToken cancellationToken = default)
    {

        return await repository.GetBasket(userName, false, cancellationToken);
    }

    public async Task<ShoppingCart> CreateBasket(ShoppingCart basket, CancellationToken cancellationToken = default)
    {
       return await repository.CreateBasket(basket, cancellationToken);

    }

    public async Task<bool> DeleteBasket(string userName, CancellationToken cancellationToken = default)
    {
       return await repository.DeleteBasket(userName, cancellationToken);
    }

    public async Task<int> SaveChangesAsync(string? userName = null, CancellationToken cancellationToken = default)
    {
    
          return await repository.SaveChangesAsync(userName, cancellationToken);
    }
}