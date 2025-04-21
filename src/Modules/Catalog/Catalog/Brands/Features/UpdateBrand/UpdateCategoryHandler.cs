using Catalog.Brands.DTOs;
using Catalog.Brands.Exception;
using Catalog.Products.Features.UpdateProduct;

namespace Catalog.Brands.Features.UpdateBrand
{
    public record UpdateBrandRequest
    {
        public string Name { get; init; } = string.Empty;
    }

    public record UpdateBrandResponse(bool IsSuccessful);

    public record UpdateBrandCommand(BrandDTO Brand)
           : ICommand<UpdateBrandResult>;

    public class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
    {
        public UpdateBrandCommandValidator()
        {
            RuleFor(x => x.Brand.Id).NotEmpty().WithMessage("Id is required");
            RuleFor(x => x.Brand.Name).NotEmpty().WithMessage("Name is required");
        }
    }

    public record UpdateBrandResult(bool IsSuccessful);
    internal class UpdateBrandHandler : ICommandHandler<UpdateBrandCommand, UpdateBrandResult>
    {
        private readonly CatalogDbContext _dbContext;

        public UpdateBrandHandler(CatalogDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UpdateBrandResult> Handle(UpdateBrandCommand command,
            CancellationToken cancellationToken)
        {
            // Find the brand using the Id from BrandDTO
            var brand = await _dbContext.Brands
                .FindAsync(command.Brand.Id, cancellationToken);

            if (brand == null)
            {
                throw new BrandNotFoundException(command.Brand.Id);
            }

            // Use the Update method to change the name
            brand.Update(command.Brand.Name);

            // Update the brand in the database
            _dbContext.Brands.Update(brand);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new UpdateBrandResult(true);
        }
    }
}
