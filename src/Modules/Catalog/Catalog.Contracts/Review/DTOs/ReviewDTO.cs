namespace Catalog.Contracts.Review.DTOs;

public record ReviewDTO
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ReviewerUserName { get; init; } = string.Empty;
    public string ReviewText { get; init; } = string.Empty;
    public int Rating { get; init; }
    public Guid ReviewerUserId { get; set; }
    public DateTime CreatedAt { get; set; }

}
