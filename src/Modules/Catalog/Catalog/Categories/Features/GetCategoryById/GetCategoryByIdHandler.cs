using Microsoft.EntityFrameworkCore;
using Catalog.Categories.DTOs;
using Catalog.Categories.Exception;


public record GetCategoryByIdQuery(Guid Id) : IQuery<GetCategoryByIdResult>;
public record GetCategoryByIdResult(CategoryDTO Category);

namespace Catalog.Categories.Features.GetCategoryById
{
    internal class GetCategoryByIdHandler(CatalogDbContext dbContext)
       : IQueryHandler<GetCategoryByIdQuery, GetCategoryByIdResult>
    {
        public async Task<GetCategoryByIdResult> Handle(GetCategoryByIdQuery query, CancellationToken cancellationToken)
        {
            var category = await dbContext.Categories
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(c => c.Id == query.Id, cancellationToken);

            if (category == null)
                throw new CategoryNotFoundException(query.Id);

            var categoryDto = category.Adapt<CategoryDTO>();
            return new GetCategoryByIdResult(categoryDto);
        }
    }
}
