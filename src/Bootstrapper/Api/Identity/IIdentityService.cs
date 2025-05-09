﻿namespace Api.Identity
{
    public interface IIdentityService
    {
        Task RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            CancellationToken ct = default);
    }
}
