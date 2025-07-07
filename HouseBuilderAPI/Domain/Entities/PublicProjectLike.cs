namespace Domain.Entities
{
    public class PublicProjectLike
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PublicProjectId { get; set; }
        public Guid UserId { get; set; }
        public DateTime LikedAt { get; set; } = DateTime.UtcNow;

        public PublicProject PublicProject { get; set; }
    }
}
