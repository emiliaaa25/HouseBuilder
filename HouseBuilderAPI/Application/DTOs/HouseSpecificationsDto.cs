using Domain.Entities;

namespace Application.DTOs
{
    public class HouseSpecificationsDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public RoofType RoofType { get; set; }
        public HouseShapeType ShapeType { get; set; }
        public Dictionary<string, float> ShapeParameters { get; set; } = new();
        public MaterialSpecificationDto WallMaterial { get; set; }
        public MaterialSpecificationDto RoofMaterial { get; set; }
        public MaterialSpecificationDto FloorMaterial { get; set; }
        public string MaterialCustomizations { get; set; }

        public int NumFloors { get; set; }

        public List<Floor> Floors { get; set; }


    }
}
