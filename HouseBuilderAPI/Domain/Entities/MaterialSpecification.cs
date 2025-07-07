namespace Domain.Entities
{
    public class MaterialSpecification
    {
        public MaterialType Type { get; set; }
        public string Color { get; set; } = "#ffffff";
        public string TexturePath { get; set; } = "";
    }
}
public enum MaterialType
{
    Brick,          // Cărămidă
    Stone,          // Piatră
    Concrete,       // Beton
    Stucco,         // Tencuială decorativă
    Wood,           // Lemn
    Vinyl,          // Vinil
    Metal,          // Metal

    // Materiale pentru acoperiș
    Tile,           // Țiglă
    Shingles,       // Șindrilă
    Slate,          // Ardezie
    MetalRoof,      // Tablă

    // Materiale pentru podele exterioare
    NaturalStone,   // Piatră naturală
    Porcelain,      // Gresie porțelanată
    WoodDeck,       // Deck lemn
    Composite,      // Compozit
}