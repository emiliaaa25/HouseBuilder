export enum MaterialType {
    Brick,          // Cărămidă
    Stone,          // Piatră
    Concrete,       // Beton
    Stucco,         // Tencuială decorativă
    Wood,           // Lemn
    Vinyl,          // Vinil
    Metal,          // Metal
    Tile,           // Țiglă
    MetalRoof,      // Tablă
    Composite,      // Compozit
  }
  
  export interface MaterialSpecification {
    type: MaterialType;
    color?: string;
    texturePath?: string;
  }
  