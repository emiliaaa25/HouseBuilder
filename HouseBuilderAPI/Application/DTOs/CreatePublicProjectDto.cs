namespace Application.DTOs
{
    public class CreatePublicProjectDto
    {
        public Guid ProjectId { get; set; }
        public string? Thumbnail { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? AuthorName { get; set; }
    }
}
