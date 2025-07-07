namespace Domain.Entities.Shapes
{
    public class TShapeParameters : HouseShapeParameters
    {
        public TShapeParameters()
        {
            ShapeType = HouseShapeType.TShape;
        }
        public float MainLength { get; set; }
        public float MainWidth { get; set; }
        public float CrossLength { get; set; }
        public float CrossWidth { get; set; }
    }
}
