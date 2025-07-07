import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MaterialSpecification, MaterialType } from '../../models/materialSpecification.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TextureCategory {
  name: string;
  folder: string;
  textures: Texture[];
}

interface Texture {
  name: string;
  path: string;
  thumbnail: string;
}

@Component({
  selector: 'app-material-selector',
  templateUrl: './material-selector.component.html',
  styleUrls: ['./material-selector.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
})
export class MaterialSelectorComponent implements OnInit {
  @Input() materialType: string = 'wall'; 
  @Input() material!: MaterialSpecification;
  @Output() materialChange = new EventEmitter<MaterialSpecification>();

  MaterialType = MaterialType; 
  isTextureBrowserOpen: boolean = false;
  selectedCategory: TextureCategory | null = null;
  selectedTexture: Texture | null = null;
textureCategories: TextureCategory[] = [
    {
        name: 'Brick',
        folder: 'assets/textures/brick',
        textures: [
            { name: 'Red Brick', path: 'assets/textures/brick/red_brick.jpg', thumbnail: 'assets/textures/brick/red_brick.jpg' },
            { name: 'White Brick', path: 'assets/textures/brick/white_brick.jpg', thumbnail: 'assets/textures/brick/white_brick.jpg' },
            { name: 'Old Brick', path: 'assets/textures/brick/old_brick.jpg', thumbnail: 'assets/textures/brick/old_brick.jpg' },
            { name: 'Brown Brick', path: 'assets/textures/brick/brown_brick.jpg', thumbnail: 'assets/textures/brick/brown_brick.jpg' }
        ]
    },
    {
        name: 'Stone',
        folder: 'assets/textures/stone',
        textures: [
            { name: 'Granite', path: 'assets/textures/stone/granite.jpg', thumbnail: 'assets/textures/stone/granite.jpg' },
            { name: 'Limestone', path: 'assets/textures/stone/limestone.jpg', thumbnail: 'assets/textures/stone/limestone.jpg' },
            { name: 'Sandstone', path: 'assets/textures/stone/sandstone.jpg', thumbnail: 'assets/textures/stone/sandstone.jpg' },
            { name: 'Marble', path: 'assets/textures/stone/marble.jpg', thumbnail: 'assets/textures/stone/marble.jpg' },        ]
    },
    {
        name: 'Concrete',
        folder: 'assets/textures/concrete',
        textures: [
            { name: 'Smooth Concrete', path: 'assets/textures/concrete/smooth.jpg', thumbnail: 'assets/textures/concrete/smooth.jpg' },
            { name: 'Rough Concrete', path: 'assets/textures/concrete/rough.jpg', thumbnail: 'assets/textures/concrete/rough.jpg' },
            { name: 'Exposed Aggregate', path: 'assets/textures/concrete/exposed.jpg', thumbnail: 'assets/textures/concrete/exposed.jpg' },
            { name: 'Stamped Concrete', path: 'assets/textures/concrete/stamped.jpg', thumbnail: 'assets/textures/concrete/stamped.jpg' }
        ]
    },
    {
        name: 'Stucco',
        folder: 'assets/textures/stucco',
        textures: [
            { name: 'Smooth Stucco', path: 'assets/textures/stucco/smooth.jpg', thumbnail: 'assets/textures/stucco/smooth.jpg' },
            { name: 'Medium Texture', path: 'assets/textures/stucco/medium.jpg', thumbnail: 'assets/textures/stucco/medium.jpg' },
            { name: 'Rough Stucco', path: 'assets/textures/stucco/rough.jpg', thumbnail: 'assets/textures/stucco/rough.jpg' },
            { name: 'Spanish Stucco', path: 'assets/textures/stucco/spanish.jpg', thumbnail: 'assets/textures/stucco/spanish.jpg' }
        ]
    },
    {
        name: 'Wood',
        folder: 'assets/textures/wood',
        textures: [
        { name: 'Oak', path: 'assets/textures/wood/oak.jpg', thumbnail: 'assets/textures/wood/oak.jpg' },
        { name: 'Pine', path: 'assets/textures/wood/pine.jpg', thumbnail: 'assets/textures/wood/pine.jpg' },
        { name: 'Walnut', path: 'assets/textures/wood/walnut.jpg', thumbnail: 'assets/textures/wood/walnut.jpg' },
        { name: 'Maple', path: 'assets/textures/wood/maple.jpg', thumbnail: 'assets/textures/wood/maple.jpg' }
        ]
    },
    {
        name: 'Vinyl',
        folder: 'assets/textures/vinyl',
        textures: [
            { name: 'Horizontal Vinyl', path: 'assets/textures/vinyl/horizontal.jpg', thumbnail: 'assets/textures/vinyl/horizontal.jpg' },
            { name: 'Vertical Vinyl', path: 'assets/textures/vinyl/vertical.jpg', thumbnail: 'assets/textures/vinyl/vertical.jpg' },
            { name: 'Board & Batten', path: 'assets/textures/vinyl/board_batten.jpg', thumbnail: 'assets/textures/vinyl/board_batten.jpg' },
            { name: 'Shake Style', path: 'assets/textures/vinyl/shake.jpg', thumbnail: 'assets/textures/vinyl/shake.jpg' }
        ]
    },
    {
        name: 'Metal',
        folder: 'assets/textures/metal',
        textures: [
            { name: 'Corrugated Metal', path: 'assets/textures/metal/corrugated.jpg', thumbnail: 'assets/textures/metal/corrugated.jpg' },
            { name: 'Standing Seam', path: 'assets/textures/metal/standing_seam.jpg', thumbnail: 'assets/textures/metal/standing_seam.jpg' },
            { name: 'Aluminum Siding', path: 'assets/textures/metal/aluminum.jpg', thumbnail: 'assets/textures/metal/aluminum.jpg' },
        ]
    },
    {
        name: 'Tile',
        folder: 'assets/textures/tile',
        textures: [
            { name: 'Clay Tile Red', path: 'assets/textures/tile/clay_red.jpg', thumbnail: 'assets/textures/tile/clay_red.jpg' },
            { name: 'Clay Tile Black', path: 'assets/textures/tile/clay_black.jpg', thumbnail: 'assets/textures/tile/clay_black.jpg' },

        ]
    },
    {
        name: 'MetalRoof',
        folder: 'assets/textures/metal_roof',
        textures: [
            { name: 'Corrugated Steel', path: 'assets/textures/metal_roof/corrugated.jpg', thumbnail: 'assets/textures/metal_roof/corrugated.jpg' },
        ]
    },
    {
        name: 'Composite',
        folder: 'assets/textures/composite',
        textures: [
            { name: 'WPC Composite', path: 'assets/textures/composite/wpc.jpg', thumbnail: 'assets/textures/composite/wpc.jpg' },
            { name: 'PVC Composite', path: 'assets/textures/composite/pvc.jpg', thumbnail: 'assets/textures/composite/pvc.jpg' },
            
        ]
    }
];
  materialTypeNames = {
    [MaterialType.Brick]: 'Brick',
    [MaterialType.Stone]: 'Stone',
    [MaterialType.Concrete]: 'Concrete',
    [MaterialType.Stucco]: 'Stucco',
    [MaterialType.Wood]: 'Wood',
    [MaterialType.Vinyl]: 'Vinyl',
    [MaterialType.Metal]: 'Metal',
    [MaterialType.Tile]: 'Tile',
    [MaterialType.MetalRoof]: 'Metal Roof',
    [MaterialType.Composite]: 'Composite',
  };
  defaultMaterialColors = {
    [MaterialType.Brick]: '#a33c2c',
    [MaterialType.Stone]: '#989898',
    [MaterialType.Concrete]: '#c0c0c0',
    [MaterialType.Stucco]: '#f0e4d4',
    [MaterialType.Wood]: '#b68e68',
    [MaterialType.Vinyl]: '#e2e2e2',
    [MaterialType.Metal]: '#b1b5b8',
    [MaterialType.Tile]: '#dd9f93',
    [MaterialType.MetalRoof]: '#7a8d8f',
    [MaterialType.Composite]: '#d3d3d3'
  };
  colorPresets = [
      { name: 'Transparent', value: 'transparent' },  
    { name: 'White', value: '#ffffff' },
    { name: 'Off White', value: '#f5f5f5' },
    { name: 'Light Gray', value: '#d3d3d3' },
    { name: 'Gray', value: '#808080' },
    { name: 'Dark Gray', value: '#404040' },
    { name: 'Black', value: '#000000' },
    { name: 'Beige', value: '#f5f5dc' },
    { name: 'Tan', value: '#d2b48c' },
    { name: 'Brown', value: '#8b4513' },
    { name: 'Red', value: '#b22222' },
    { name: 'Burgundy', value: '#800020' },
    { name: 'Navy', value: '#000080' },
    { name: 'Blue', value: '#4169e1' },
    { name: 'Light Blue', value: '#87ceeb' },
    { name: 'Green', value: '#228b22' },
    { name: 'Olive', value: '#808000' },
    { name: 'Yellow', value: '#ffd700' }
  ];

  constructor() {}

  ngOnInit(): void {
    if (!this.material) {
      this.material = {
        type: MaterialType.Brick,
        color: this.defaultMaterialColors[MaterialType.Brick]
      };
    } else {
      if (!this.material.color || this.material.color === '') {
        this.material.color = this.defaultMaterialColors[this.material.type];
      }
    }
    if (this.material.texturePath) {
      this.findAndSetCurrentTexture();
    }
  }

 resetMaterial(): void {
    this.material = {
      type: MaterialType.Brick,
      color: this.defaultMaterialColors[MaterialType.Brick],
      texturePath: undefined
    };
    this.selectedTexture = null;
    this.materialChange.emit({...this.material});
  }
isTransparent(color: string): boolean {
  return color === 'transparent' || color === 'rgba(255, 255, 255, 0)' || color === '';
}
  findAndSetCurrentTexture(): void {
    if (!this.material.texturePath) {
      this.selectedTexture = null;
      return;
    }
    
    for (const category of this.textureCategories) {
      const texture = category.textures.find(t => t.path === this.material.texturePath);
      if (texture) {
        this.selectedTexture = texture;
        return;
      }
    }
  }
  getMaterialTypeOptions(): { value: MaterialType, name: string }[] {
    let allowedTypes: MaterialType[] = [];
    
    switch (this.materialType) {
      case 'wall':
        allowedTypes = [
          MaterialType.Brick, 
          MaterialType.Wood,
          MaterialType.Stone,
          MaterialType.Concrete,
          MaterialType.Vinyl,
          MaterialType.Stucco,
          MaterialType.Metal
        ];
        break;
        
      case 'roof':
        allowedTypes = [
          MaterialType.Tile,
          MaterialType.MetalRoof,
          MaterialType.Metal
        ];
        break;
        
      case 'floor':
        allowedTypes = [
          MaterialType.Wood,
          MaterialType.Composite,
          MaterialType.Stone,
          MaterialType.Concrete
        ];
        break;
        
      default:
        allowedTypes = Object.values(MaterialType)
          .filter(value => typeof value === 'number')
          .map(value => value as MaterialType);
    }
    
    return allowedTypes.map(type => ({
      value: type,
      name: this.materialTypeNames[type]
    }));
  }

  onMaterialTypeChange(): void {
  const previousColor = this.material.color;
  if (!previousColor || previousColor === this.defaultMaterialColors[this.material.type]) {
    this.material.color = this.defaultMaterialColors[this.material.type];
  }
  this.material.texturePath = undefined;
  this.selectedTexture = null;
  this.materialChange.emit({...this.material});
}

  onColorChange(): void {
    this.materialChange.emit({...this.material});
  }

  selectColorPreset(color: string): void {
    this.material.color = color;
    this.materialChange.emit({...this.material});
  }

  openTextureBrowser(): void {
    this.isTextureBrowserOpen = true;
    const materialTypeName = this.materialTypeNames[this.material.type];
    this.selectedCategory = this.textureCategories.find(category => 
      category.name.toLowerCase() === materialTypeName.toLowerCase()
    ) || this.textureCategories[0];
    this.findAndSetCurrentTexture();
  }

  closeTextureBrowser(): void {
    this.isTextureBrowserOpen = false;
  }

  selectCategory(category: TextureCategory): void {
    this.selectedCategory = category;
  }

  selectTexture(texture: Texture): void {
    this.selectedTexture = texture;
    this.material.texturePath = texture.path;
    this.materialChange.emit({...this.material});
    this.isTextureBrowserOpen = false;
  }

  clearTexture(): void {
    this.material.texturePath = undefined;
    this.selectedTexture = null;
    this.materialChange.emit({...this.material});
  }
  isTextureSelected(texture: Texture): boolean {
    return this.selectedTexture?.path === texture.path;
  }
  getMaterialTypeName(type: MaterialType): string {
    return this.materialTypeNames[type] || 'Unknown';
  }
  getTextureNameFromPath(path: string): string {
    if (!path) return 'None';
    for (const category of this.textureCategories) {
      const texture = category.textures.find(t => t.path === path);
      if (texture) {
        return `${category.name} - ${texture.name}`;
      }
    }
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  }
}