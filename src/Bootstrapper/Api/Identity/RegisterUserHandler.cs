using MediatR;
public record RegisterUserCommand(string FirstName, string LastName, string Email, string Password) : IRequest<Unit>;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Unit>
{
    private readonly IIdentityService _identity;
    public RegisterUserHandler(IIdentityService identity) => _identity = identity;

    public async Task<Unit> Handle(RegisterUserCommand cmd, CancellationToken ct)
    {
        await _identity.RegisterAsync(cmd.FirstName, cmd.LastName, cmd.Email, cmd.Password, ct);
        return Unit.Value;
    }
}
