namespace Api.Register
{
    public class KeycloakSettings
    {
        public string Authority { get; set; } = default!; // e.g. https://localhost:9090
        public string Realm { get; set; } = default!; // your realm name
        public string ClientId { get; set; } = default!;
        public string ClientSecret { get; set; } = default!;
    }
}
