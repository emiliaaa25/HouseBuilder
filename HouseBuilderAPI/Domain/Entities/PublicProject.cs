namespace Domain.Entities
{
    public class PublicProject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProjectId { get; set; } 
        public string? Thumbnail { get; set; } 
        public int Views { get; set; } = 0;
        public int Likes { get; set; } = 0;
        public string? AuthorName { get; set; } 
        public string? Title { get; set; } 
        public string? Description { get; set; }
        public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Project Project { get; set; }
    }
}
