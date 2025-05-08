namespace Api.Identity
{
    public class KeycloakSettings
    {
        public string Authority { get; set; } = "http://localhost:9090/realms/myrealm";
        public string ClientId { get; set; } = "myclient";         // duhet të ketë rol manage-users
        public string ClientSecret { get; set; } = "l3CH5cLjdZloCLaLlsBYHqgwA6jUlDY2";  // nga client configuration
        public string Realm { get; set; } = "myrealm";
    }
}
