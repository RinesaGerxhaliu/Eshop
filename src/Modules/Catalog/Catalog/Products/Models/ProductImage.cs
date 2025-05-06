using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Catalog.Products.Models
{
    public class ProductImage
    {
        [Key]
        [ForeignKey(nameof(Product))]
        public Guid ProductId { get; private set; } = default!;
        public string ImageUrl { get; private set; } = default!;

        internal ProductImage(Guid productId, string imageUrl)
        {
            ProductId = productId;
            ImageUrl = imageUrl;
        }
    }
}
