namespace Catalog.Categories.Features.DeleteCategory
{
    public record DeleteCategoryCommand(Guid CategoryId) : ICommand<DeleteCategoryResult>;
    public record DeleteCategoryResult(bool IsSuccessful);
    internal class DeleteCategoryHandler(CatalogDbContext dbContext)
        : ICommandHandler<DeleteCategoryCommand, DeleteCategoryResult>
    {
        public async Task<DeleteCategoryResult> Handle(DeleteCategoryCommand command, CancellationToken cancellationToken)
        {
            var category = await dbContext.Categories
                .FindAsync(command.CategoryId, cancellationToken);

            if (category is null)
            {
                throw new KeyNotFoundException($"Category with ID {command.CategoryId} not found.");
            }

            dbContext.Categories.Remove(category);
            await dbContext.SaveChangesAsync(cancellationToken);

            return new DeleteCategoryResult(true);
        }
    }
}
