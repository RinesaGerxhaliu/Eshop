using Shared.Exceptions;

namespace Catalog.Categories.Exception
{
    public class CategoryNotFoundException : NotFoundException
    {
        public CategoryNotFoundException(Guid Id) : base("Category", Id)
        {
        }
    }
}
