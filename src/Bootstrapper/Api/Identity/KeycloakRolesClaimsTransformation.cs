using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;

namespace Api.Identity
{
    public class KeycloakRolesClaimsTransformation : IClaimsTransformation
    {
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            var identity = (ClaimsIdentity)principal.Identity!;

            var resourceAccessClaim = principal.FindFirst("resource_access");
            if (resourceAccessClaim is not null)
            {
                using var doc = JsonDocument.Parse(resourceAccessClaim.Value);

                if (doc.RootElement.TryGetProperty("myclient", out var clientElement) &&
                    clientElement.TryGetProperty("roles", out var rolesElement))
                {
                    foreach (var role in rolesElement.EnumerateArray())
                    {
                        identity.AddClaim(new Claim(ClaimTypes.Role, role.GetString()!));
                    }
                }
            }

            return Task.FromResult(principal);
        }
    }
}
