using Shared.Exceptions;

namespace Catalog.Brands.Exception
{
    public class BrandNotFoundException : NotFoundException
    {
        public BrandNotFoundException(Guid Id) : base("Brand", Id)
        {
        }
    }
}
