using Catalog.Categories.DTOs;
using Catalog.Categories.Features.GetSubcategoriesByCategory.Catalog.Categories.Features.GetSubcategoriesByCategory;
using Shared.Pagination;

namespace Catalog.Categories.Features.GetSubcategoriesByCategory
{
    public record GetSubcategoriesByCategoryResponse(PaginatedResult<SubcategoryDto> Subcategories);

    public class GetSubcategoriesByCategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                    "/categories/{categoryId:guid}/subcategories",
                    async (
                        [AsParameters] PaginationRequest pagination,
                        Guid categoryId,
                        ISender sender
                    ) =>
                    {
                        var result = await sender.Send(
                            new GetSubcategoriesByCategoryQuery(pagination, categoryId)
                        );

                        var response = new GetSubcategoriesByCategoryResponse(result.Subcategories);
                        return Results.Ok(response);
                    }
                )
               .WithName("Get Subcategories By Category")
               .Produces<GetSubcategoriesByCategoryResponse>(StatusCodes.Status200OK)
               .ProducesProblem(StatusCodes.Status400BadRequest)
               .WithSummary("Get paged subcategories for a given category")
               .WithDescription("Returns a paged list of subcategories filtered by categoryId.");
        }
    }
}
