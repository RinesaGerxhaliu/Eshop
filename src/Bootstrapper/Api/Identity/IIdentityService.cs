namespace Api.Identity
{
    public interface IIdentityService
    {
        Task RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            CancellationToken ct = default);

        Task<LoginResult> LoginAsync(
            string email,
            string password,
            CancellationToken ct = default);

        Task<RefreshTokenResult> RefreshTokenAsync(
            string refreshToken,
            CancellationToken ct = default);
    }
}
