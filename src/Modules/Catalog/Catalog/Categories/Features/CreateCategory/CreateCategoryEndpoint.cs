namespace Catalog.Categories.Features.CreateCategory;

public record CreateCategoryRequest
{
    public string Name { get; init; } = string.Empty;
}

public record CreateCategoryResponse(Guid Id);

public class CreateCategoryEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/categories", async (
            CreateCategoryRequest request,
            ISender sender) =>
        {
            var command = request.Adapt<CreateCategoryCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<CreateCategoryResponse>();

            return Results.Created($"/categories/{response.Id}", response);
        })
        .WithName("Create Category")
        .Produces<CreateCategoryResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Category")
        .WithDescription("Creates a new product category.");
    }
}
