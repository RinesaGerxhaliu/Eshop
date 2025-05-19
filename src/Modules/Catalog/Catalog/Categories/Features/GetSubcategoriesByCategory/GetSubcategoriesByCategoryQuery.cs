using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetSubcategoriesByCategory
{
    namespace Catalog.Categories.Features.GetSubcategoriesByCategory
    {
        public record GetSubcategoriesByCategoryQuery(
            PaginationRequest PaginationRequest,
            Guid CategoryId
        ) : IQuery<GetSubcategoriesByCategoryResult>;

        public record GetSubcategoriesByCategoryResult(
            PaginatedResult<SubcategoryDto> Subcategories
        );
    }

}
