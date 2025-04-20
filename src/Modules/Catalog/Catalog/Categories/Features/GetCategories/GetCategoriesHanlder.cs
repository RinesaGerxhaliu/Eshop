using Microsoft.EntityFrameworkCore;
using Shared.Pagination;
using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.GetCategories
{
    public record GetCategoriesQuery() : IQuery<GetCategoriesResult>;

    public record GetCategoriesResult(List<CategoryDTO> Categories);


    internal class GetCategoriesHandler(CatalogDbContext dbContext)
        : IQueryHandler<GetCategoriesQuery, GetCategoriesResult>
    {
        public async Task<GetCategoriesResult> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
        {
            var categories = await dbContext.Categories.ToListAsync(cancellationToken);

            var categoryDtos = categories.Adapt<List<CategoryDTO>>();

            return new GetCategoriesResult(categoryDtos);
        }
    }
}
