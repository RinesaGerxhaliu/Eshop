namespace Api.Register;
public interface IUserService
{
    Task RegisterUserAsync(RegisterRequest request);
}

