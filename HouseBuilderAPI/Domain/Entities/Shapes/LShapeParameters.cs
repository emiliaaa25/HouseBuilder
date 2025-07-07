namespace Domain.Entities.Shapes
{
    public class LShapeParameters : HouseShapeParameters
    {
        public LShapeParameters()
        {
            ShapeType = HouseShapeType.LShape;
        }
        public float MainLength { get; set; }
        public float MainWidth { get; set; }
        public float ExtensionLength { get; set; }
        public float ExtensionWidth { get; set; }
    }
}
