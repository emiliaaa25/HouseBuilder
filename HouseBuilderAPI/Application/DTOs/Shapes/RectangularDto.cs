namespace Application.DTOs.Shapes
{
    public class RectangularDto
    {
        public Guid Id { get; set; }
        public Guid HouseSpecificationsId { get; set; }
        public float Length { get; set; }
        public float Width { get; set; }
    }
}
