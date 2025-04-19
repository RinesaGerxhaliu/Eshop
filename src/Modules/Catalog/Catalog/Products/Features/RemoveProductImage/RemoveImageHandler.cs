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
        var product = await _repository.GetByIdAsync(cmd.ProductId, ct);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product {cmd.ProductId} not found");
        }

        var image = product.Images.FirstOrDefault(img => img.Id == cmd.ImageId);
        if (image == null)
        {
            return false; 
        }
        product.RemoveImage(cmd.ImageId); 

        await _repository.SaveAsync(product, ct);

        return true;
    }
}
