using Catalog.Contracts.Products.DTOs;
using Catalog.Products.Models;
using Mapster;

namespace Api
{
    public class MapsterConfig
    {
        public static void RegisterMappings()
        {
            TypeAdapterConfig<Product, ProductDTO>
                .NewConfig()
                .Map(dest => dest.ImageUrl, src => src.Image!.ImageUrl);
        }
    }
}
