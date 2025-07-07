using Domain.Entities;

namespace Application.DTOs
{
    public class ProjectDto
    {
        public Guid Id { get; set; }
        public Guid ConstructorId { get; set; }
        public string Address { get; set; }
       
        public string Description { get; set; }
        public ProjectStatus Status { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}