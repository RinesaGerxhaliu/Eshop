using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Api.Identity
{
    // Command & Result together
    public record RefreshTokenCommand(string RefreshToken) : IRequest<RefreshTokenResult>;

    public record RefreshTokenResult(
        bool Success,
        string? AccessToken,
        string? RefreshToken,
        string? Error
    );

    // Handler
    public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
    {
        private readonly IIdentityService _identity;
        public RefreshTokenHandler(IIdentityService identity) => _identity = identity;

        public async Task<RefreshTokenResult> Handle(RefreshTokenCommand cmd, CancellationToken ct)
        {
            // This calls your KeycloakIdentityService or similar logic
            return await _identity.RefreshTokenAsync(cmd.RefreshToken, ct);
        }
    }
}
