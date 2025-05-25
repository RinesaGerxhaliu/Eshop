namespace Api.Identity
{
    public class KeycloakSettings
    {
        public string Authority { get; set; } = "http://localhost:9090/realms/myrealm";
        public string ClientId { get; set; } = "myclient";         // duhet të ketë rol manage-users
        public string ClientSecret { get; set; } = "2QVYFZpSm5Rf3XEwluFzVPzwRc76Q4nq";  // nga client configuration
        public string Realm { get; set; } = "myrealm";
    }
}
