using Carter;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Mapster;
using MediatR;
using Ordering.Orders.Dtos;

public record CreateSavedAddressRequest(SavedAddressDto SavedAddress);
public record CreateSavedAddressResponse(Guid Id);

public class CreateSavedAddressEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/saved-addresses", async (CreateSavedAddressRequest request, ISender sender) =>
        {
            var command = request.Adapt<CreateSavedAddressCommand>();
            var result = await sender.Send(command);
            var response = result.Adapt<CreateSavedAddressResponse>();

            return Results.Created($"/saved-addresses/{response.Id}", response);
        })
        .WithName("CreateSavedAddress")
        .Produces<CreateSavedAddressResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Saved Address")
        .WithDescription("Creates a new saved address for the customer.");
    }
}

