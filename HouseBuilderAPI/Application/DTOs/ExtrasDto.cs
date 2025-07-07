
namespace Application.DTOs
{
    public class ExtrasDto
    {
        public Guid Id { get; set; }
        public Guid HouseSpecificationsId { get; set; }
        public List<DoorDto> Doors { get; set; } = new List<DoorDto>();
        public List<WindowDto> Windows { get; set; } = new List<WindowDto>();
    }
}
