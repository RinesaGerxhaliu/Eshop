namespace Catalog.Categories.Features.DeleteSubcategory
{
    using FluentValidation;
    using MediatR;

    public record DeleteSubcategoryCommand(Guid SubcategoryId)
        : IRequest<DeleteSubcategoryResult>;

    public record DeleteSubcategoryResult(bool IsSuccessful);

    public class DeleteSubcategoryCommandValidator
        : AbstractValidator<DeleteSubcategoryCommand>
    {
        public DeleteSubcategoryCommandValidator()
        {
            RuleFor(x => x.SubcategoryId)
                .NotEmpty().WithMessage("Subcategory Id is required");
        }
    }

    internal class DeleteSubcategoryHandler
        : IRequestHandler<DeleteSubcategoryCommand, DeleteSubcategoryResult>
    {
        private readonly CatalogDbContext _dbContext;

        public DeleteSubcategoryHandler(CatalogDbContext dbContext)
            => _dbContext = dbContext;

        public async Task<DeleteSubcategoryResult> Handle(
            DeleteSubcategoryCommand command,
            CancellationToken cancellationToken)
        {
            var sub = await _dbContext.Subcategories
                .FindAsync(new object[] { command.SubcategoryId }, cancellationToken);

            if (sub is null)
            {
                return new DeleteSubcategoryResult(false);
            }

            _dbContext.Subcategories.Remove(sub);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new DeleteSubcategoryResult(true);
        }
    }
}
