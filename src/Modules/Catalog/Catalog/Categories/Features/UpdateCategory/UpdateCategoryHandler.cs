using Catalog.Categories.DTOs;
using Catalog.Categories.Exception;
using Catalog.Products.Features.UpdateProduct;

namespace Catalog.Categories.Features.UpdateCategory
{
    public record UpdateCategoryRequest
    {
        public string Name { get; init; } = string.Empty;
    }

    public record UpdateCategoryResponse(bool IsSuccessful);

    public record UpdateCategoryCommand(CategoryDTO Category)
           : ICommand<UpdateCategoryResult>;

    public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
    {
        public UpdateCategoryCommandValidator()
        {
            RuleFor(x => x.Category.Id).NotEmpty().WithMessage("Id is required");
            RuleFor(x => x.Category.Name).NotEmpty().WithMessage("Name is required");
        }
    }

    public record UpdateCategoryResult(bool IsSuccessful);
    internal class UpdateCategoryHandler : ICommandHandler<UpdateCategoryCommand, UpdateCategoryResult>
    {
        private readonly CatalogDbContext _dbContext;

        public UpdateCategoryHandler(CatalogDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UpdateCategoryResult> Handle(UpdateCategoryCommand command,
            CancellationToken cancellationToken)
        {
            // Find the category using the Id from CategoryDTO
            var category = await _dbContext.Categories
                .FindAsync(command.Category.Id, cancellationToken);

            if (category == null)
            {
                throw new CategoryNotFoundException(command.Category.Id);
            }

            // Use the Update method to change the name
            category.Update(command.Category.Name);

            // Update the category in the database
            _dbContext.Categories.Update(category);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new UpdateCategoryResult(true);
        }
    }
}
