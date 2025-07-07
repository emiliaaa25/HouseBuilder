namespace Domain.Entities
{
    public class PublicProjectView
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PublicProjectId { get; set; }
        public Guid? UserId { get; set; } 
        public string? IpAddress { get; set; } 
        public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

        public PublicProject PublicProject { get; set; }
    }
}
