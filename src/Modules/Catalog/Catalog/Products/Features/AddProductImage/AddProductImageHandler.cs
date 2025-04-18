using Catalog.Data.Repositories;

namespace Catalog.Products.Features.AddProductImage
{
    // --- Command + Result + Validator
    public record AddProductImageCommand(Guid ProductId, string ImageUrl) : ICommand<AddProductImageResult>;

    public record AddProductImageResult(Guid ImageId);

    public class AddProductImageCommandValidator : AbstractValidator<AddProductImageCommand>
    {
        public AddProductImageCommandValidator()
        {
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.ImageUrl).NotEmpty();
        }
    }

    // --- Handler (primary‑constructor style)
    internal class AddProductImageHandler(IProductRepository repository)
        : ICommandHandler<AddProductImageCommand, AddProductImageResult>
    {
        private readonly IProductRepository _repository = repository;

        public async Task<AddProductImageResult> Handle(AddProductImageCommand cmd, CancellationToken ct)
        {
            var product = await _repository.GetByIdAsync(cmd.ProductId, ct)
                          ?? throw new KeyNotFoundException($"Product {cmd.ProductId} not found");

            product.AddImage(cmd.ImageUrl);
            await _repository.SaveAsync(product, ct);

            var newImage = product.Images.Last(img => img.ImageUrl == cmd.ImageUrl);
            return new AddProductImageResult(newImage.Id);
        }
    }
}
