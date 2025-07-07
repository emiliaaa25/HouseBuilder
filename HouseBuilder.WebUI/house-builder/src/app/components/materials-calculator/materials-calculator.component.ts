import { Component, Input, Output, EventEmitter, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseSpecifications, HouseShapeType, RoofType } from '../../models/houseSpecifications.model';
import { MaterialType } from '../../models/materialSpecification.model';
import { Extras } from '../../models/extras.model';
import { ExtrasService } from '../../services/extras.service';
import { ActivatedRoute } from '@angular/router';

interface MaterialQuantity {
  name: string;
  quantity: number;
  unit: string;
  category: 'structural' | 'roofing' | 'flooring' | 'finishing';
  estimatedCost?: number;
  notes?: string;
}

interface MaterialSummary {
  structural: MaterialQuantity[];
  roofing: MaterialQuantity[];
  flooring: MaterialQuantity[];
  finishing: MaterialQuantity[];
  totalEstimatedCost: number;
}

@Component({
  selector: 'app-materials-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materials-calculator.component.html',
  styleUrls: ['./materials-calculator.component.css'],
})
export class MaterialsCalculatorComponent implements OnInit {
  @Input() houseSpecs!: HouseSpecifications;

  @Output() closeModal = new EventEmitter<void>();

  materialSummary: MaterialSummary = {
    structural: [],
    roofing: [],
    flooring: [],
    finishing: [],
    totalEstimatedCost: 0
  };

  expandedCategories = {
    structural: true,
    roofing: false,
    flooring: false,
    finishing: false,
  };

  totalFloorArea = 0;
  wallPerimeter = 0;
 extrasData: Extras | null = null;
  extrasId: string = '';

  houseSpecsId: string = '';

  constructor() {}
    private extrasService = inject(ExtrasService);


  ngOnInit(): void {
    this.calculateDimensions();
    this.loadExtrasAndCalculateMaterials(); 
  }

  private calculateDimensions(): void {
    if (!this.houseSpecs) return;
    this.houseSpecsId = this.houseSpecs.id || '';

    switch (this.houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        const length = this.houseSpecs.shapeParameters?.['Length'] || 0;
        const width = this.houseSpecs.shapeParameters?.['Width'] || 0;
        this.totalFloorArea = length * width;
        this.wallPerimeter = 2 * (length + width);
        break;

      case HouseShapeType.Square:
        const size = this.houseSpecs.shapeParameters?.['Size'] || 0;
        this.totalFloorArea = size * size;
        this.wallPerimeter = 4 * size;
        break;

      case HouseShapeType.LShape:
        const mainLength = this.houseSpecs.shapeParameters?.['MainLength'] || 0;
        const mainWidth = this.houseSpecs.shapeParameters?.['MainWidth'] || 0;
        const extLength = this.houseSpecs.shapeParameters?.['ExtensionLength'] || 0;
        const extWidth = this.houseSpecs.shapeParameters?.['ExtensionWidth'] || 0;
        
        this.totalFloorArea = (mainLength * mainWidth) + (extLength * extWidth);
        this.wallPerimeter = 2 * (mainLength + mainWidth + extLength + extWidth - extWidth);
        break;

      case HouseShapeType.TShape:
        const tMainLength = this.houseSpecs.shapeParameters?.['MainLength'] || 0;
        const tMainWidth = this.houseSpecs.shapeParameters?.['MainWidth'] || 0;
        const crossLength = this.houseSpecs.shapeParameters?.['CrossLength'] || 0;
        const crossWidth = this.houseSpecs.shapeParameters?.['CrossWidth'] || 0;
        const overlapArea = Math.min(tMainWidth, crossWidth) * Math.min(tMainLength, crossLength);
        this.totalFloorArea = (tMainLength * tMainWidth) + (crossLength * crossWidth) - overlapArea;
        this.wallPerimeter = 2 * (tMainLength + tMainWidth + crossLength + crossWidth) - 2 * Math.min(tMainWidth, crossWidth);
        break;

      case HouseShapeType.UShape:
        const baseLength = this.houseSpecs.shapeParameters?.['BaseLength'] || 0;
        const baseWidth = this.houseSpecs.shapeParameters?.['BaseWidth'] || 0;
        const leftWingLength = this.houseSpecs.shapeParameters?.['LeftWingLength'] || 0;
        const leftWingWidth = this.houseSpecs.shapeParameters?.['LeftWingWidth'] || this.houseSpecs.shapeParameters?.['leftWingWidth'] || 0;
        const rightWingLength = this.houseSpecs.shapeParameters?.['RightWingLength'] || 0;
        const rightWingWidth = this.houseSpecs.shapeParameters?.['RightWingWidth'] || 0;
        
        this.totalFloorArea = (baseLength * baseWidth) + (leftWingLength * leftWingWidth) + (rightWingLength * rightWingWidth);
        this.wallPerimeter = 2 * baseLength + 2 * baseWidth + 2 * leftWingLength + 2 * leftWingWidth + 2 * rightWingLength + 2 * rightWingWidth - 4 * Math.min(baseWidth, leftWingWidth, rightWingWidth);
        break;

      default:
        this.totalFloorArea = 100; 
        this.wallPerimeter = 40;
    }
  }

  private calculateMaterials(): void {
    this.materialSummary = {
      structural: this.calculateStructuralMaterials(),
      roofing: this.calculateRoofingMaterials(),
      flooring: this.calculateFlooringMaterials(),
      finishing: this.calculateFinishingMaterials(),
      totalEstimatedCost: 0
    };
    this.materialSummary.totalEstimatedCost = 
      this.getCategoryTotal('structural') +
      this.getCategoryTotal('roofing') +
      this.getCategoryTotal('flooring') +
      this.getCategoryTotal('finishing');
  }

  private calculateStructuralMaterials(): MaterialQuantity[] {
    const materials: MaterialQuantity[] = [];
    const wallArea = this.wallPerimeter * this.getTotalHeight();
    const numFloors = this.houseSpecs.numFloors || 1;
    const foundationVolume = this.totalFloorArea * 0.3;
    materials.push({
      name: 'Concrete Foundation',
      quantity: foundationVolume,
      unit: 'm³',
      category: 'structural',
      estimatedCost: foundationVolume * 100,
      notes: 'Reinforced concrete foundation, 30cm depth'
    });

    materials.push({
      name: 'Rebar Steel',
      quantity: foundationVolume * 80, 
      unit: 'kg',
      category: 'structural',
      estimatedCost: foundationVolume * 80 * 0.6, 
      notes: 'Foundation reinforcement bars'
    });

    const wallMaterialType = this.houseSpecs.wallMaterial?.type || MaterialType.Brick;
    
    switch (wallMaterialType) {
      case MaterialType.Brick:
        const brickQuantity = wallArea*5;
        materials.push({
          name: 'Clay Bricks',
          quantity: brickQuantity,
          unit: 'pieces',
          category: 'structural',
          estimatedCost: brickQuantity * 0.50, 
          notes: 'Standard clay bricks for wall construction'
        });
        
        const mortarVolume = wallArea * 0.025; 
        materials.push({
          name: 'Mortar',
          quantity: mortarVolume,
          unit: 'm³',
          category: 'structural',
          estimatedCost: mortarVolume * 82, 
          notes: 'Cement-sand mortar for brickwork'
        });
        break;

      case MaterialType.Concrete:
        const blocksQuantity = wallArea * 12.5;
        materials.push({
          name: 'Concrete Blocks',
          quantity: blocksQuantity,
          unit: 'pieces',
          category: 'structural',
          estimatedCost: blocksQuantity * 3.0, 
          notes: 'Standard concrete blocks 20x20x40cm'
        });
        break;

      case MaterialType.Wood:
        const timberVolume = wallArea * 0.15;
        materials.push({
          name: 'Timber Frame',
          quantity: timberVolume,
          unit: 'm³',
          category: 'structural',
          estimatedCost: timberVolume * 550, 
          notes: 'Structural timber for frame construction'
        });
        
        const sheatheingArea = wallArea * 1.1;
        materials.push({
          name: 'OSB Sheathing',
          quantity: sheatheingArea,
          unit: 'm²',
          category: 'structural',
          estimatedCost: sheatheingArea * 30, 
          notes: '18mm OSB boards for wall sheathing'
        });
        break;
    }

    for (let floor = 1; floor < numFloors; floor++) {
      const slabVolume = this.totalFloorArea * 0.15;
      materials.push({
        name: `Floor ${floor + 1} - Concrete Slab`,
        quantity: slabVolume,
        unit: 'm³',
        category: 'structural',
        estimatedCost: slabVolume * 100, 
        notes: `Reinforced concrete slab for floor ${floor + 1}`
      });
      
      const steelWeight = this.totalFloorArea * 25;
      materials.push({
        name: `Floor ${floor + 1} - Steel Beams`,
        quantity: steelWeight,
        unit: 'kg',
        category: 'structural',
        estimatedCost: steelWeight * 0.6,
        notes: `Structural steel beams for floor ${floor + 1}`
      });
    }

    materials.push({
      name: 'Wall Insulation',
      quantity: wallArea,
      unit: 'm²',
      category: 'structural',
      estimatedCost: wallArea * 18, 
      notes: 'Mineral wool insulation, 10cm thickness'
    });

    return materials;
  }

  private calculateRoofingMaterials(): MaterialQuantity[] {
    const materials: MaterialQuantity[] = [];
    const roofArea = this.calculateRoofArea();

    const trussVolume = this.totalFloorArea * 0.08;
    materials.push({
      name: 'Roof Trusses',
      quantity: trussVolume,
      unit: 'm²',
      category: 'roofing',
      estimatedCost: trussVolume * 50,
      notes: 'Engineered timber roof trusses'
    });

    const sheathingArea = roofArea * 1.1;
    materials.push({
      name: 'Roof Sheathing',
      quantity: sheathingArea,
      unit: 'm²',
      category: 'roofing',
      estimatedCost: sheathingArea * 25, 
      notes: '18mm OSB roof sheathing'
    });
    const roofMaterialType = this.houseSpecs.roofMaterial?.type || MaterialType.MetalRoof;
    switch (roofMaterialType) {
      case MaterialType.MetalRoof:
      case MaterialType.Metal:
        const metalArea = roofArea * 1.15;
        materials.push({
          name: 'Metal Roofing Sheets',
          quantity: metalArea,
          unit: 'm²',
          category: 'roofing',
          estimatedCost: metalArea * 55, 
          notes: 'Galvanized steel roofing sheets'
        });
        break;

      case MaterialType.Tile:
        const tileQuantity = roofArea * 35;
        materials.push({
          name: 'Clay Roof Tiles',
          quantity: tileQuantity,
          unit: 'pieces',
          category: 'roofing',
          estimatedCost: tileQuantity * 2.2, 
          notes: 'Standard clay roof tiles'
        });
        break;

      default:
        const shingleArea = roofArea * 1.15;
        materials.push({
          name: 'Asphalt Shingles',
          quantity: shingleArea,
          unit: 'm²',
          category: 'roofing',
          estimatedCost: shingleArea * 40,
          notes: 'Standard asphalt shingles with underlayment'
        });
        break;
    }

    materials.push({
      name: 'Gutters',
      quantity: this.wallPerimeter,
      unit: 'm',
      category: 'roofing',
      estimatedCost: this.wallPerimeter * 30, 
      notes: 'PVC guttering system with downpipes'
    });

    materials.push({
      name: 'Roof Insulation',
      quantity: roofArea,
      unit: 'm²',
      category: 'roofing',
      estimatedCost: roofArea * 22, 
      notes: 'Mineral wool roof insulation, 20cm thickness'
    });

    return materials;
  }

  private calculateFlooringMaterials(): MaterialQuantity[] {
    const materials: MaterialQuantity[] = [];
    const numFloors = this.houseSpecs.numFloors || 1;
    const totalFlooringArea = this.totalFloorArea * numFloors;
    const screedVolume = totalFlooringArea * 0.05;
    materials.push({
      name: 'Floor Screed',
      quantity: screedVolume,
      unit: 'm³',
      category: 'flooring',
      estimatedCost: screedVolume * 110,
      notes: 'Cement screed for floor leveling'
    });
    const floorMaterialType = this.houseSpecs.floorMaterial?.type || MaterialType.Wood;
    
    switch (floorMaterialType) {
      case MaterialType.Wood:
        const woodArea = totalFlooringArea * 1.1;
        materials.push({
          name: 'Hardwood Flooring',
          quantity: woodArea,
          unit: 'm²',
          category: 'flooring',
          estimatedCost: woodArea * 75, 
          notes: 'Engineered hardwood flooring with installation'
        });
        break;

      case MaterialType.Tile:
        const tileArea = totalFlooringArea * 1.15;
        materials.push({
          name: 'Ceramic Floor Tiles',
          quantity: tileArea,
          unit: 'm²',
          category: 'flooring',
          estimatedCost: tileArea * 45, 
          notes: 'Ceramic tiles with adhesive and grout'
        });
        break;

      case MaterialType.Vinyl:
        const vinylArea = totalFlooringArea * 1.08;
        materials.push({
          name: 'Luxury Vinyl Flooring',
          quantity: vinylArea,
          unit: 'm²',
          category: 'flooring',
          estimatedCost: vinylArea * 40,
          notes: 'Luxury vinyl plank flooring'
        });
        break;

      case MaterialType.Composite:
        const compositeArea = totalFlooringArea * 1.1;
        materials.push({
          name: 'Composite Flooring',
          quantity: compositeArea,
          unit: 'm²',
          category: 'flooring',
          estimatedCost: compositeArea * 55,
          notes: 'WPC composite flooring'
        });
        break;
    }
    materials.push({
      name: 'Floor Polystyrene Insulation',
      quantity: this.totalFloorArea,
      unit: 'm²',
      category: 'flooring',
      estimatedCost: this.totalFloorArea * 15, 
      notes: 'Rigid foam insulation under ground floor'
    });

    return materials;
  }
private loadExtrasAndCalculateMaterials(): void {
    if (!this.houseSpecsId) {
      return;
    }
    this.extrasService.getExtras(this.houseSpecsId).subscribe({
        next: (extras) => {          
          if (extras && extras.length > 0) {
            this.extrasData = extras[0];
            this.extrasId = this.extrasData.id || '';
          } else {
            this.extrasData = null;
          }
          
          this.calculateMaterials();
        },
        error: (error) => {
          console.warn('Error loading extras for materials calculation:', error);
          this.extrasData = null;
          this.calculateMaterials();
        }
      });
}

  private getWindowsAndDoorsData(): { 
    numWindows: number, 
    numDoors: number, 
    windowsCost: number, 
    doorsCost: number 
  } {
    if (this.extrasData) {
      const numWindows = this.extrasData.windows?.length || 0;
      const numDoors = this.extrasData.doors?.length || 0;
      const windowsCost = numWindows * 400; 
      const doorsCost = numDoors * 300;       
      return { numWindows, numDoors, windowsCost, doorsCost };
    } else {
      const numFloors = this.houseSpecs.numFloors || 1;
      const numWindows = Math.max(4, Math.floor(this.totalFloorArea / 12)); 
      const numDoors = Math.max(2, numFloors + 1); 
      const windowsCost = numWindows * 400;
      const doorsCost = numDoors * 300;
      return { numWindows, numDoors, windowsCost, doorsCost };
    }
  }

  private calculateFinishingMaterials(): MaterialQuantity[] {
    const materials: MaterialQuantity[] = [];
    const { numWindows, numDoors, windowsCost, doorsCost } = this.getWindowsAndDoorsData();

    materials.push({
      name: 'Windows',
      quantity: numWindows,
      unit: 'pieces',
      category: 'finishing',
      estimatedCost: windowsCost,
      notes: this.extrasData ? 
        'Custom windows placed by client in 3D editor' : 
        'Double-glazed PVC windows, average size (estimated)'
    });

    materials.push({
      name: 'Doors',
      quantity: numDoors,
      unit: 'pieces',
      category: 'finishing',
      estimatedCost: doorsCost,
      notes: this.extrasData ? 
        'Custom doors placed by client in 3D editor' : 
        'Interior and exterior doors with hardware (estimated)'
    });


    return materials;
  }

  private calculateRoofArea(): number {
    let multiplier = 1.0;
    switch (this.houseSpecs.roofType) {
      case RoofType.Flat:
        multiplier = 1.05; 
        break;
      case RoofType.Gable:
        multiplier = 1.3; 
        break;
      case RoofType.Cross_gabled:
        multiplier = 1.35; 
        break;
      case RoofType.Hip:
        multiplier = 1.25; 
        break;
      case RoofType.Pyramid:
        multiplier = 1.4; 
        break;
      default:
        multiplier = 1.2; 
    }
    
    return this.totalFloorArea * multiplier;
  }

  getTotalHeight(): number {
    if (!this.houseSpecs.floors || this.houseSpecs.floors.length === 0) {
      return (this.houseSpecs.numFloors || 1) * 3.0;
    }
    
    return this.houseSpecs.floors.reduce((total, floor) => total + (floor.floorHeigth || 3.0), 0);
  }

  getShapeTypeName(): string {
    const shapeNames = {
      [HouseShapeType.Rectangular]: 'Rectangular',
      [HouseShapeType.Square]: 'Square',
      [HouseShapeType.LShape]: 'L-Shape',
      [HouseShapeType.TShape]: 'T-Shape',
      [HouseShapeType.UShape]: 'U-Shape'
    };
    return this.houseSpecs.shapeType !== undefined
      ? shapeNames[this.houseSpecs.shapeType as keyof typeof shapeNames] || 'Unknown'
      : 'Unknown';
  }

  getRoofTypeName(): string {
    const roofNames: Record<string, string> = {
      [RoofType.Flat]: 'Flat',
      [RoofType.Gable]: 'Gable',
      [RoofType.Hip]: 'Hip',
      [RoofType.Cross_gabled]: 'Cross Gabled',
      [RoofType.Pyramid]: 'Pyramid'
    };
    return roofNames[String(this.houseSpecs.roofType)] || 'Flat';
  }

  toggleCategory(category: keyof typeof this.expandedCategories): void {
    this.expandedCategories[category] = !this.expandedCategories[category];
  }

  getCategoryTotal(category: keyof MaterialSummary): number {
    if (!this.materialSummary[category] || !Array.isArray(this.materialSummary[category])) {
      return 0;
    }
    return (this.materialSummary[category] as MaterialQuantity[])
      .reduce((total, material) => total + (material.estimatedCost || 0), 0);
  }

  exportToCSV(): void {
    const csvData: string[] = [];
    csvData.push('Category,Material,Quantity,Unit,Estimated Cost (€),Notes');
    Object.entries(this.materialSummary).forEach(([category, materials]) => {
      if (Array.isArray(materials)) {
        materials.forEach(material => {
          const row = [
            category,
            material.name,
            material.quantity.toFixed(2),
            material.unit,
            (material.estimatedCost || 0).toFixed(2),
            material.notes || ''
          ];
          csvData.push(row.map(field => `"${field}"`).join(','));
        });
      }
    });
    csvData.push('');
    csvData.push('TOTALS');
    csvData.push(`Structural,,,,"${this.getCategoryTotal('structural').toFixed(2)}",`);
    csvData.push(`Roofing,,,,"${this.getCategoryTotal('roofing').toFixed(2)}",`);
    csvData.push(`Flooring,,,,"${this.getCategoryTotal('flooring').toFixed(2)}",`);
    csvData.push(`Finishing,,,,"${this.getCategoryTotal('finishing').toFixed(2)}",`);
    csvData.push(`TOTAL,,,,"${this.materialSummary.totalEstimatedCost.toFixed(2)}",`);
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materials_list_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  close(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}