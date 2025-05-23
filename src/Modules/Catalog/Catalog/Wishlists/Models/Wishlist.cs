namespace Catalog.Wishlists.Models
{
    public class Wishlist : Aggregate<Guid>
    {
        public string UserName { get; private set; } = default!;  

        private readonly List<WishlistItem> _items = new();
        public IReadOnlyList<WishlistItem> Items
            => _items.AsReadOnly();

        private Wishlist() { }

        public static Wishlist Create(Guid id, string userName)
        {
            ArgumentException.ThrowIfNullOrEmpty(userName);

            var wishlist = new Wishlist
            {
                Id = id,
                UserName = userName
            };

            return wishlist;
        }

        public void AddItem(Guid productId, decimal priceWhenAdded, string productName)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(priceWhenAdded);

            var existingItem = Items.FirstOrDefault(x => x.ProductId == productId);

                var newItem = new WishlistItem(Id, productId, priceWhenAdded, productName);
                _items.Add(newItem);
            
        }

        public void RemoveItem(Guid productId)
        {
            var item = _items.FirstOrDefault(x => x.ProductId == productId);
            if (item is not null)
                _items.Remove(item);
        }
    }
}
