namespace Ordering.Data.Configurations
{
    public class StripeSettings
    {
        public string SecretKey { get; set; } = default!;
        public string PublishableKey { get; set; } = default!;
        public string WebhookSecret { get; set; } = default!; // if you use webhooks
    }
}
