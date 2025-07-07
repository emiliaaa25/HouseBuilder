namespace Domain.Entities.Shapes
{
    public class RectangularShapeParameters : HouseShapeParameters
    {
        public RectangularShapeParameters( )
        {
            ShapeType = HouseShapeType.Rectangular;
        }
        public float Length { get; set; }
        public float Width { get; set; }
    }
}
