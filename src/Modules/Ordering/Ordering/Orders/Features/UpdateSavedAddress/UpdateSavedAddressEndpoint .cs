using Carter;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;


    public class UpdateSavedAddressEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/saved-addresses/{id:guid}", async (Guid id, UpdateSavedAddressCommand command, ISender sender) =>
            {
                if (id != command.SavedAddress.Id)
                    return Results.BadRequest("Mismatched ID");

                await sender.Send(command);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithName("UpdateSavedAddress")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .WithSummary("Update a saved address")
            .WithDescription("Updates an existing saved address by ID.");
        }
    }

