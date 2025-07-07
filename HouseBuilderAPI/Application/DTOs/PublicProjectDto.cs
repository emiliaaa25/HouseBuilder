namespace Application.DTOs
{
    public class PublicProjectDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string? Thumbnail { get; set; }
        public int Views { get; set; }
        public int Likes { get; set; }
        public string? AuthorName { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime PublishedAt { get; set; }
        public bool IsLikedByCurrentUser { get; set; } = false;
    }
}
