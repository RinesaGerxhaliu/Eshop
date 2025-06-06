using MediatR;
using Microsoft.AspNetCore.Identity.Data;

namespace Api.Identity
{
    public class AuthModule : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/register", async (
                    [FromBody] RegisterRequest req,
                    ISender sender) =>
            {
                if (string.IsNullOrWhiteSpace(req.FirstName) ||
                    string.IsNullOrWhiteSpace(req.LastName) ||
                    string.IsNullOrWhiteSpace(req.Email) ||
                    string.IsNullOrWhiteSpace(req.Password))
                    return Results.BadRequest("All fields are required.");

                try
                {
                    await sender.Send(new RegisterUserCommand(req.FirstName, req.LastName, req.Email, req.Password));
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

            app.MapPost("/auth/login", async (
                [FromBody] LoginRequest req,
                HttpResponse response,
                ISender sender
            ) =>
            {
                var result = await sender.Send(new LoginUserCommand(req.Email, req.Password));
                if (!result.Success)
                    return Results.BadRequest(result.Error);

                response.Cookies.Append("refreshToken", result.RefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/",
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Results.Ok(new { accessToken = result.AccessToken });
            })
            .Accepts<LoginRequest>("application/json")
            .Produces(StatusCodes.Status200OK)
            .WithName("Login")
            .WithSummary("Login user and issue HttpOnly refresh token cookie");

            app.MapPost("/auth/refresh", async (
                HttpRequest request,
                HttpResponse response,
                ISender sender
            ) =>
            {
                var refreshToken = request.Cookies["refreshToken"];
                if (string.IsNullOrWhiteSpace(refreshToken))
                    return Results.Unauthorized();

                var result = await sender.Send(new RefreshTokenCommand(refreshToken));
                if (!result.Success)
                    return Results.Unauthorized();

                response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true, // to see cookie in dev tools, but for production true is recommended
                    Secure = true,   // must be false if using HTTP
                    SameSite = SameSiteMode.None, // to allow cross-site
                    Path = "/",
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });


                return Results.Ok(new { accessToken = result.AccessToken });
            })
            .Produces(StatusCodes.Status200OK)
            .WithName("RefreshToken")
            .WithSummary("Refresh access token using HttpOnly cookie");

            app.MapPost("/auth/logout", (HttpResponse response) =>
            {
                response.Cookies.Append(
                    "refreshToken",
                    "",
                    new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,               
                        SameSite = SameSiteMode.None,
                        Path = "/",                  
                        Expires = DateTimeOffset.UtcNow.AddDays(-1)
                    }
                );

                return Results.Ok(new { message = "Logged out" });
            })
            .WithName("Logout")
            .WithSummary("Clears the HttpOnly refreshToken cookie");

        }
    }
}
