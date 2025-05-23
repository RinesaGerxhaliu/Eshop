namespace Api.Identity
{
    public class KeycloakIdentityService : IIdentityService
    {
        private readonly HttpClient _http;
        private readonly KeycloakSettings _settings;

        public KeycloakIdentityService(HttpClient http, IOptions<KeycloakSettings> opts)
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
            var tokenUrl = $"{_settings.Authority}/protocol/openid-connect/token";
            var tokenResponse = await _http.PostAsync(
                tokenUrl,
                new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("client_id", _settings.ClientId),
                    new KeyValuePair<string, string>("client_secret", _settings.ClientSecret)
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

            var userUrl = $"http://localhost:9090/admin/realms/{_settings.Realm}/users";
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
                        type = "password",
                        value = password,
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

        public async Task<LoginResult> LoginAsync(string email, string password, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(email))
                throw new ArgumentNullException(nameof(email), "Email cannot be null or empty.");
            if (string.IsNullOrEmpty(password))
                throw new ArgumentNullException(nameof(password), "Password cannot be null or empty.");

            var tokenUrl = $"{_settings.Authority}/protocol/openid-connect/token";
            var parameters = new Dictionary<string, string>
    {
        { "grant_type", "password" },
        { "client_id", _settings.ClientId ?? throw new InvalidOperationException("ClientId is not configured.") },
        { "client_secret", _settings.ClientSecret ?? throw new InvalidOperationException("ClientSecret is not configured.") },
        { "username", email },
        { "password", password }
    };

            var response = await _http.PostAsync(tokenUrl, new FormUrlEncodedContent(parameters), ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                return new LoginResult(false, null, null, $"Login failed: {error}");
            }

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            var root = doc.RootElement;

            var accessToken = root.GetProperty("access_token").GetString();
            var refreshToken = root.GetProperty("refresh_token").GetString();

            return new LoginResult(true, accessToken, refreshToken, null);
        }

        public async Task<RefreshTokenResult> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(refreshToken))
                throw new ArgumentNullException(nameof(refreshToken), "Refresh token cannot be null or empty.");

            var tokenUrl = $"{_settings.Authority}/protocol/openid-connect/token";
            var parameters = new Dictionary<string, string>
    {
        { "grant_type", "refresh_token" },
        { "client_id", _settings.ClientId ?? throw new InvalidOperationException("ClientId is not configured.") },
        { "client_secret", _settings.ClientSecret ?? throw new InvalidOperationException("ClientSecret is not configured.") },
        { "refresh_token", refreshToken }
    };

            var response = await _http.PostAsync(tokenUrl, new FormUrlEncodedContent(parameters), ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                return new RefreshTokenResult(false, null, null, $"Refresh failed: {error}");
            }

            using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
            var root = doc.RootElement;

            var newAccessToken = root.GetProperty("access_token").GetString();
            var newRefreshToken = root.GetProperty("refresh_token").GetString();

            return new RefreshTokenResult(true, newAccessToken, newRefreshToken, null);
        }

    }
}
