using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetAllSubcategories
{
    public record GetAllSubcategoriesResponse(PaginatedResult<SubcategoryDto> Subcategories);

    public class GetAllSubcategoriesEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet(
                "/subcategories",
                async ([AsParameters] PaginationRequest pagination, ISender sender) =>
                {
                    var result = await sender.Send(new GetAllSubcategoriesQuery(pagination));
                    var response = new GetAllSubcategoriesResponse(result.Subcategories);
                    return Results.Ok(response);
                }
            )
            .WithName("GetAllSubcategories")
            .Produces<GetAllSubcategoriesResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Get all subcategories paginated")
            .WithDescription("Returns a paged list of all subcategories.");
        }
    }
}
