using Catalog.Brands.DTOs;

namespace Catalog.Brands.Features.UpdateBrand
{
    public class UpdateBrandEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/brands/{id}", async (Guid id, UpdateBrandRequest request, ISender sender) =>
            {
                var brandDto = new BrandDTO
                {
                    Id = id,
                    Name = request.Name
                };

                var command = new UpdateBrandCommand(brandDto);

                var result = await sender.Send(command);

                var response = new UpdateBrandResponse(result.IsSuccessful);

                return Results.Ok(response);
            })
            .WithName("Update Brand")
            .Produces<UpdateBrandResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .WithSummary("Update Brand")
            .WithDescription("Update an existing Brand.");
        }
    }
}
