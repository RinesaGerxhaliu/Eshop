using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetAllSubcategories
{
    public record GetAllSubcategoriesQuery(PaginationRequest Pagination) : IQuery<GetAllSubcategoriesResult>;

    public record GetAllSubcategoriesResult(PaginatedResult<SubcategoryDto> Subcategories);
}
