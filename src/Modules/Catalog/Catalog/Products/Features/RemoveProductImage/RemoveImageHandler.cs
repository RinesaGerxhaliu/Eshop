using Catalog.Products.Features.RemoveProductImage;

public record RemoveProductImageCommand(Guid ProductId, Guid ImageId) : ICommand<bool>;
internal class RemoveImageHandler : ICommandHandler<RemoveProductImageCommand, bool>

{
    private readonly IProductRepository _repository;

    public RemoveImageHandler(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(RemoveProductImageCommand cmd, CancellationToken ct)
    {
        var product = await _repository.GetByIdAsync(cmd.ProductId, ct)
                      ?? throw new KeyNotFoundException($"Product {cmd.ProductId} not found");

        // on a 1:1 image relationship, product.Image is either null or the single image
        if (product.Image is null || product.Image.ProductId != cmd.ImageId)
            return false;

        product.RemoveImage(cmd.ImageId);
        await _repository.SaveAsync(product, ct);

        return true;
    }
}
