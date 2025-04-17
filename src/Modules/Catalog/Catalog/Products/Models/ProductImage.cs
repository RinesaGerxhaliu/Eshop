namespace Catalog.Products.Models
{
    public class ProductImage : Entity<Guid>
    {
        public Guid ProductId { get; private set; } = default!;
        public string ImageUrl { get; private set; } = default!;

        internal ProductImage(Guid productId, string imageUrl)
        {
            ProductId = productId;
            ImageUrl = imageUrl;
        }
    }
}
