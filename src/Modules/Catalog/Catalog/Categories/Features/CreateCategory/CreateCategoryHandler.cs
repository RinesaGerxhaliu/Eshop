namespace Catalog.Categories.Features.CreateCategory;

public record CreateCategoryCommand(string Name) : IRequest<CreateCategoryResult>;

public record CreateCategoryResult(Guid Id);

internal class CreateCategoryHandler(CatalogDbContext dbContext)
    : IRequestHandler<CreateCategoryCommand, CreateCategoryResult>
{
    public async Task<CreateCategoryResult> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = new Category(Guid.NewGuid(), command.Name);

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateCategoryResult(category.Id);
    }
}
