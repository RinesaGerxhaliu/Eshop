namespace Catalog.Wishlists.Models
{
    public class Wishlist : Aggregate<Guid>
    {
        public string CustomerId { get; private set; } = default!;
        private readonly List<WishlistItem> _items = new();
        public IReadOnlyList<WishlistItem> Items
            => _items.AsReadOnly();

        private Wishlist() { }

        public static Wishlist Create(Guid id, string customerId)
        {
            if (string.IsNullOrWhiteSpace(customerId))
                throw new ArgumentNullException(nameof(customerId));

            return new Wishlist
            {
                Id = id,
                CustomerId = customerId
            };
        }

        public void AddItem(Guid productId, decimal priceWhenAdded, string productName)
        {
            if (_items.Any(x => x.ProductId == productId))
                return;

            var item = new WishlistItem(
                wishlistId: Id,
                productId: productId,
                priceWhenAdded: priceWhenAdded,
                productName: productName);

            _items.Add(item);
        }


        public void RemoveItem(Guid productId)
        {
            var item = _items.FirstOrDefault(x => x.ProductId == productId);
            if (item is not null)
                _items.Remove(item);
        }
    }
}
