using Domain.Entities.Shapes;

namespace Domain.Entities
{
    public class HouseSpecifications
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public HouseShapeType ShapeType { get; set; }
        public RoofType RoofType { get; set; }
        public HouseShapeParameters ShapeParameters { get; set; }

        public MaterialSpecification WallMaterial { get; set; } = new MaterialSpecification
        {
            Type = MaterialType.Brick,
            Color = "#a52a2a",
            TexturePath = "assets/textures/brick.jpg"
        };

        public MaterialSpecification RoofMaterial { get; set; } = new MaterialSpecification
        {
            Type = MaterialType.Shingles,
            Color = "#8b4513",
            TexturePath = "assets/textures/roof.jpg"
        };

        public MaterialSpecification FloorMaterial { get; set; } = new MaterialSpecification
        {
            Type = MaterialType.Concrete,
            Color = "#808080",
            TexturePath = "assets/textures/concrete.jpg"
        };

        public string MaterialCustomizations { get; set; } = "{}";

        public int NumFloors { get; set; } = 1;
        public List<Floor> Floors { get; set; } = new List<Floor>();


    }
}
public enum RoofType
{
    Gable, 
    Hip,
    Mansard,
    Flat,
    Shed,
    Pyramid,
    Dome,
    Cross_gabled,
    Intersecting_hip,
    Gable_roof_with_extension,
    Hip_roof_with_extension,
    Cross_gabled_T_configuration,
    Multiple_valley,
    Multiple_gable,
    Courtyard,
    Complex_hip_and_valley,
    Connected_section,
    Partial_flat_roof_with_hipped_wings
}
public enum HouseShapeType
{
    Rectangular,
    Square,
    LShape,
    TShape,
    UShape
}