using Carter;
using Microsoft.AspNetCore.Routing;

namespace Api.Register;

public class AuthModule : CarterModule
{
    public override void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/register", async (RegisterRequest request, HttpContext ctx) =>
        {
            var userService = ctx.RequestServices.GetRequiredService<IUserService>();

            await userService.RegisterUserAsync(request);

            return Results.Ok(new { Message = "User registered successfully" });
        });
    }
}


