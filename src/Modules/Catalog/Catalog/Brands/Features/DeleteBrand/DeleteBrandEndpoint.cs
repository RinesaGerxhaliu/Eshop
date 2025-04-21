namespace Catalog.Brands.Features.DeleteBrand
{
    public class DeleteBrandEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/brands/{id}", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new DeleteBrandCommand(id));

                var response = new DeleteBrandResult(result.IsSuccessful);

                return Results.Ok(response);
            })
            .WithName("Delete Brand")
            .Produces<DeleteBrandResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Delete Brand")
            .WithDescription("Delete a brand by its ID.");
        }
    }
}
