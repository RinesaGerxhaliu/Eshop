using MediatR;

public record LoginUserCommand(string Email, string Password) : IRequest<LoginResult>;

public record LoginResult(bool Success, string? AccessToken, string? RefreshToken, string? Error);

public class LoginUserHandler : IRequestHandler<LoginUserCommand, LoginResult>
{
    private readonly IIdentityService _authService;
    public LoginUserHandler(IIdentityService authService) => _authService = authService;

    public async Task<LoginResult> Handle(LoginUserCommand cmd, CancellationToken ct)
    {
        var tokens = await _authService.LoginAsync(cmd.Email, cmd.Password);
        if (tokens == null)
            return new LoginResult(false, null, null, "Invalid credentials");
        return new LoginResult(true, tokens.AccessToken, tokens.RefreshToken, null);
    }
}
