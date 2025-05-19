using Catalog.Categories.DTOs;

namespace Catalog.Categories.Features.UpdateSubcategory
{
    public record UpdateSubcategoryCommand(SubcategoryDto Subcategory)
        : ICommand<UpdateSubcategoryResult>;

    public record UpdateSubcategoryResult(bool IsSuccessful);

    public class UpdateSubcategoryCommandValidator
        : AbstractValidator<UpdateSubcategoryCommand>
    {
        public UpdateSubcategoryCommandValidator()
        {
            RuleFor(x => x.Subcategory.Id)
                .NotEmpty().WithMessage("Id is required");
            RuleFor(x => x.Subcategory.Name)
                .NotEmpty().WithMessage("Name is required");
            RuleFor(x => x.Subcategory.CategoryId)
                .NotEmpty().WithMessage("CategoryId is required");
        }
    }

    internal class UpdateSubcategoryHandler
        : ICommandHandler<UpdateSubcategoryCommand, UpdateSubcategoryResult>
    {
        private readonly CatalogDbContext _db;

        public UpdateSubcategoryHandler(CatalogDbContext db) => _db = db;

        public async Task<UpdateSubcategoryResult> Handle(
            UpdateSubcategoryCommand command,
            CancellationToken cancellationToken)
        {
            var dto = command.Subcategory;
            var entity = await _db.Subcategories.FindAsync(new object[] { dto.Id }, cancellationToken);

            if (entity is null)
                return new UpdateSubcategoryResult(false);

            entity.Update(
                dto.Name,
                dto.CategoryId
            );

            _db.Subcategories.Update(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return new UpdateSubcategoryResult(true);
        }
    }

}