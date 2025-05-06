namespace Api.Identity
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/register", async (
                    [FromBody] RegisterRequest req,
                    IIdentityService identity) =>
            {
                if (string.IsNullOrWhiteSpace(req.FirstName) ||
                    string.IsNullOrWhiteSpace(req.LastName) ||
                    string.IsNullOrWhiteSpace(req.Email) ||
                    string.IsNullOrWhiteSpace(req.Password))
                {
                    return Results.BadRequest("All fields are required.");
                }

                try
                {
                    await identity.RegisterAsync(
                        req.FirstName,
                        req.LastName,
                        req.Email,
                        req.Password);

                    return Results.Created("/login", null);
                }
                catch (Exception ex)
                {
                    return Results.Problem(
                        detail: ex.Message,
                        statusCode: StatusCodes.Status500InternalServerError
                    );
                }
            })
               .Accepts<RegisterRequest>("application/json")
               .Produces(StatusCodes.Status201Created)
               .ProducesProblem(StatusCodes.Status500InternalServerError)
               .WithName("Register")
               .WithSummary("Registers a new user in Keycloak");
        }
    }
}
