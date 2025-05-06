namespace Api.Identity
{
    public record RegisterRequest(
        string FirstName,
        string LastName,
        string Email,
        string Password
    );
}
