namespace Api.Register;

// File: UserService.cs
using Flurl.Http;

public class UserService : IUserService
{
    private readonly IConfiguration _config;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UserService(IConfiguration config, IHttpContextAccessor httpContextAccessor)
    {
        _config = config;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task RegisterUserAsync(RegisterRequest request)
    {
        var keycloakUrl = _config["Keycloak:Url"];
        var realm = _config["Keycloak:Realm"];
        var clientId = _config["Keycloak:ClientId"];
        var clientSecret = _config["Keycloak:ClientSecret"];
        var adminUsername = _config["Keycloak:AdminUsername"];
        var adminPassword = _config["Keycloak:AdminPassword"];

        // 1. Get access token as admin
        var tokenResponse = await $"{keycloakUrl}/realms/master/protocol/openid-connect/token"
            .PostUrlEncodedAsync(new
            {
                client_id = "admin-cli",
                grant_type = "password",
                username = adminUsername,
                password = adminPassword
            })
            .ReceiveJson<TokenResponse>();

        // 2. Use token to create new user
        var userCreateResponse = await $"{keycloakUrl}/admin/realms/{realm}/users"
            .WithOAuthBearerToken(tokenResponse.AccessToken)
            .PostJsonAsync(new
            {
                username = request.Username,
                email = request.Email,
                enabled = true,
                credentials = new[]
                {
                    new {
                        type = "password",
                        value = request.Password,
                        temporary = false
                    }
                }
            });

        if (!userCreateResponse.ResponseMessage.IsSuccessStatusCode)
        {
            throw new Exception("Failed to create user in Keycloak");
        }
    }
}

