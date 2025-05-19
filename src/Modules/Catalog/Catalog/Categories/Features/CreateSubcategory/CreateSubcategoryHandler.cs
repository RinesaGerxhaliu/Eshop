namespace Catalog.Categories.Features.CreateSubcategory
{
    using Catalog.Categories.DTOs;
    using Catalog.Categories.Models;
    using FluentValidation;
    using MediatR;

    public record CreateSubcategoryCommand(SubcategoryDto Subcategory)
        : IRequest<CreateSubcategoryResult>;

    public record CreateSubcategoryResult(Guid Id);

    public class CreateSubcategoryCommandValidator
        : AbstractValidator<CreateSubcategoryCommand>
    {
        public CreateSubcategoryCommandValidator()
        {
            RuleFor(x => x.Subcategory.Name)
                .NotEmpty().WithMessage("Name is required");

            RuleFor(x => x.Subcategory.CategoryId)
                .NotEqual(Guid.Empty)
                .WithMessage("CategoryId is required");
        }
    }

    internal class CreateSubcategoryHandler
        : IRequestHandler<CreateSubcategoryCommand, CreateSubcategoryResult>
    {
        private readonly CatalogDbContext _dbContext;
        public CreateSubcategoryHandler(CatalogDbContext dbContext)
            => _dbContext = dbContext;

        public async Task<CreateSubcategoryResult> Handle(
            CreateSubcategoryCommand command,
            CancellationToken cancellationToken)
        {
            var dto = command.Subcategory;

            var entity = new Subcategory(
                Guid.NewGuid(),
                dto.Name,
                dto.CategoryId
            );

            _dbContext.Subcategories.Add(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new CreateSubcategoryResult(entity.Id);
        }
    }
}
