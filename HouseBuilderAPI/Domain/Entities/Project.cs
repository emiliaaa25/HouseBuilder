namespace Domain.Entities
{
    public enum ProjectStatus
    {
        Pending,
        InProgress,
        Completed
    }
    public class Project
    {
        public Guid Id { get; set; } 
        public Guid ConstructorId { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set;} = DateTime.UtcNow;
    }
}
