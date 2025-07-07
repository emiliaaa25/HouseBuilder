namespace Domain.Entities.Shapes
{
    public class SquareShapeParameters : HouseShapeParameters
    {
        public SquareShapeParameters()
        {
            ShapeType = HouseShapeType.Square;
        }
        public float Size { get; set; }
    }

}
