namespace Domain.Entities.Shapes
{
    public class UShapeParameters : HouseShapeParameters
    {
        public UShapeParameters()
        {
            ShapeType = HouseShapeType.UShape;
        }
        public float BaseLength { get; set; }
        public float BaseWidth { get; set; }
        public float LeftWingLength { get; set; }
        public float LeftWingWidth { get; set; }
        public float RightWingLength { get; set; }
        public float RightWingWidth { get; set; }
    }
}
