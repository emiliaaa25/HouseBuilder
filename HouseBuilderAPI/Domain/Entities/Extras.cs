namespace Domain.Entities
{
    public class Extras
    {
        public Guid Id { get; set; }
        public Guid HouseSpecificationsId { get; set; }
        public List<Door>? Doors { get; set; } = new List<Door>();
        public List<Window>? Windows { get; set; } = new List<Window>();
    }
}
