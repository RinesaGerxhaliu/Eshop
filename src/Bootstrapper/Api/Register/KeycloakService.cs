﻿namespace Api.Register
{
    internal class KeycloakIdentityService : IIdentityService
    {
        private readonly HttpClient _http;
        private readonly KeycloakSettings _settings;

        public KeycloakIdentityService(
            HttpClient http,
            IOptions<KeycloakSettings> opts)
        {
            _http = http;
            _settings = opts.Value;
        }

        public async Task RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            CancellationToken ct = default)
        {
            // 1) Acquire an admin token from Keycloak
            var tokenUrl = $"{_settings.Authority.TrimEnd('/')}/realms/{_settings.Realm}/protocol/openid-connect/token";
            var tokenResponse = await _http.PostAsync(
                tokenUrl,
                new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string,string>("grant_type",    "client_credentials"),
                    new KeyValuePair<string,string>("client_id",     _settings.ClientId),
                    new KeyValuePair<string,string>("client_secret", _settings.ClientSecret)
                }),
                ct
            );
            tokenResponse.EnsureSuccessStatusCode();

            using var doc = await JsonDocument.ParseAsync(
                await tokenResponse.Content.ReadAsStreamAsync(ct),
                cancellationToken: ct
            );
            var adminToken = doc.RootElement
                                .GetProperty("access_token")
                                .GetString()
                            ?? throw new InvalidOperationException("Keycloak token response did not contain an access_token");

            // 2) Create the new user in Keycloak
            var userUrl = $"{_settings.Authority.TrimEnd('/')}/admin/realms/{_settings.Realm}/users";
            var userPayload = new
            {
                firstName,
                lastName,
                username = email,
                email,
                enabled = true,
                credentials = new[]
                {
                    new
                    {
                        type      = "password",
                        value     = password,
                        temporary = false
                    }
                }
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, userUrl)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(userPayload),
                    Encoding.UTF8,
                    "application/json")
            };
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);

            var createRes = await _http.SendAsync(req, ct);
            createRes.EnsureSuccessStatusCode();
        }
    }
}
