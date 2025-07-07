import * as THREE from 'three';
import { MaterialService } from '../services/material.service';
import { HouseSpecifications, RoofType } from './houseSpecifications.model';
import { HouseFactoryService } from '../services/house-factory.service';
import { Floor } from './floor.model';

export class RectangularHouseModel {
  constructor(
    private houseSpecs: HouseSpecifications,
    private materialService: MaterialService,
    private houseService:HouseFactoryService
  ) { }
  
  build(houseGroup: THREE.Group): void {
    let length = 10; 
    let width = 8;  
    if (this.houseSpecs.shapeParameters) {
      if (typeof this.houseSpecs.shapeParameters['Length'] === 'number') {
        length = this.houseSpecs.shapeParameters['Length'];
      }
      
      if (typeof this.houseSpecs.shapeParameters['Width'] === 'number') {
        width = this.houseSpecs.shapeParameters['Width'];
      }
      if (typeof (this.houseSpecs.shapeParameters as any).length === 'number') {
        length = (this.houseSpecs.shapeParameters as any).length;
      }
      
      if (typeof (this.houseSpecs.shapeParameters as any).width === 'number') {
        width = (this.houseSpecs.shapeParameters as any).width;
      }
    }
    
    const totalHeight = this.houseService.calculateTotalHeight(this.houseSpecs);
    const floors = this.houseSpecs.floors
    const wallsGroup = new THREE.Group();
    this.createWalls(wallsGroup, width, length, totalHeight);
    
    this.createFloor(wallsGroup, width, length);
    
    houseGroup.add(wallsGroup);
    this.addRoof(houseGroup, width, length, totalHeight);

    this.addFloorDelimitations(houseGroup, width, length, floors);

  }
  
  private createWalls(wallsGroup: THREE.Group, width: number, length: number, height: number): void {
    const frontWallGeometry = new THREE.PlaneGeometry(width, height);
    const frontWallMaterial = this.getWallMaterial('MainFront');
    const frontWall = new THREE.Mesh(frontWallGeometry, frontWallMaterial);
    frontWall.position.set(0, height/2, -length/2);
    wallsGroup.add(frontWall);
    
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWallMaterial = this.getWallMaterial('MainBack');
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, height/2, length/2);
    backWall.rotation.y = Math.PI;
    wallsGroup.add(backWall);
    
    const leftWallGeometry = new THREE.PlaneGeometry(length, height);
    const leftWallMaterial = this.getWallMaterial('MainLeft');
    const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.rotation.y = Math.PI/2;
    wallsGroup.add(leftWall);

    const rightWallGeometry = new THREE.PlaneGeometry(length, height);
    const rightWallMaterial = this.getWallMaterial('MainRight');
    const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.rotation.y = -Math.PI/2;
    wallsGroup.add(rightWall);
   
  }
  
  
  private createFloor(wallsGroup: THREE.Group, width: number, length: number): void {
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floorMaterial = this.getFloorMaterial();
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, 0, 0);
    floor.rotation.x = -Math.PI/2;
    wallsGroup.add(floor);
  }

  private addFloorDelimitations(houseGroup: THREE.Group, width: number, length: number, floors: Floor[]): void {
    if (!floors || floors.length <= 1) return;
    
    const floorLinesGroup = new THREE.Group();
    floorLinesGroup.name = "FloorDelimiters";
    
    const sortedFloors = [...floors].sort((a, b) => a.index - b.index);
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000,
      linewidth: 3,
      transparent: true,
      opacity: 4
    });
    
    let currentHeight = 0;
    for (let i = 0; i < sortedFloors.length - 1; i++) {
      currentHeight += sortedFloors[i].floorHeigth;
      const frontLineGeometry = new THREE.BufferGeometry();
      frontLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -width/2, currentHeight, -length/2,
        width/2, currentHeight, -length/2
      ], 3));
      const frontLine = new THREE.Line(frontLineGeometry, lineMaterial);
      frontLine.name = `FloorLine_${i+1}_Front`;
      const backLineGeometry = new THREE.BufferGeometry();
      backLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -width/2, currentHeight, length/2,
        width/2, currentHeight, length/2
      ], 3));
      const backLine = new THREE.Line(backLineGeometry, lineMaterial);
      backLine.name = `FloorLine_${i+1}_Back`;
      
      const leftLineGeometry = new THREE.BufferGeometry();
      leftLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        -width/2, currentHeight, -length/2,
        -width/2, currentHeight, length/2
      ], 3));
      const leftLine = new THREE.Line(leftLineGeometry, lineMaterial);
      leftLine.name = `FloorLine_${i+1}_Left`;
      
      const rightLineGeometry = new THREE.BufferGeometry();
      rightLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
        width/2, currentHeight, -length/2,
        width/2, currentHeight, length/2
      ], 3));
      const rightLine = new THREE.Line(rightLineGeometry, lineMaterial);
      rightLine.name = `FloorLine_${i+1}_Right`;
      
      floorLinesGroup.add(frontLine);
      floorLinesGroup.add(backLine);
      floorLinesGroup.add(leftLine);
      floorLinesGroup.add(rightLine);
      
    }
    houseGroup.add(floorLinesGroup);
  }
  
  
  
  private addRoof(houseGroup: THREE.Group, width: number, length: number, wallHeight: number): void {
    const roofMaterial = this.getRoofMaterial();
    
    
    switch (this.houseSpecs.roofType) {
      case RoofType.Flat:
        this.addFlatRoof(houseGroup, width, length, wallHeight, roofMaterial);
        break;
      case RoofType.Gable:
        this.addGableRoof(houseGroup, width, length, wallHeight);
        break;
      case RoofType.Hip:
        this.createHipRoof(width, length, wallHeight, roofMaterial, houseGroup);
        break;
      default:
        this.addFlatRoof(houseGroup, width, length, wallHeight, roofMaterial);
    }
  }
  
  private addFlatRoof(houseGroup: THREE.Group, width: number, length: number, wallHeight: number, material: THREE.Material): void {
    const flatRoofGeometry = new THREE.BoxGeometry(width+1, 0.5, length+1);
    const flatRoof = new THREE.Mesh(flatRoofGeometry, material);
    flatRoof.position.y = wallHeight + 0.1;
    houseGroup.add(flatRoof);
  }
 
    addGableRoof(houseGroup: THREE.Group, width: number, length: number, wallHeight: number): void {
      const roofMargin = 0.5;
      
      const adjustedWidth = width + roofMargin * 2;
      const adjustedLength = length + roofMargin * 2;
      const roofHeight = adjustedWidth / 3.5; 
      const roofMaterial = this.getRoofMaterial();
      const roofGeometry = new THREE.BufferGeometry();
      const exactFrontZ = -length/2;
      const exactBackZ = length/2;
      const vertices = new Float32Array([
        -width/2, wallHeight, exactFrontZ,           
        0, wallHeight + roofHeight, exactFrontZ,     
        -adjustedWidth/2, wallHeight, -adjustedLength/2, 
        0, wallHeight + roofHeight, exactFrontZ,    
        0, wallHeight + roofHeight, -adjustedLength/2,  
        -adjustedWidth/2, wallHeight, -adjustedLength/2, 
        -width/2, wallHeight, exactFrontZ,           
        -width/2, wallHeight, exactBackZ,            
        0, wallHeight + roofHeight, exactFrontZ,    
        
        -width/2, wallHeight, exactBackZ,            
        0, wallHeight + roofHeight, exactBackZ,      
        0, wallHeight + roofHeight, exactFrontZ,      
        0, wallHeight + roofHeight, exactBackZ,      
        0, wallHeight + roofHeight, adjustedLength/2,    
        -adjustedWidth/2, wallHeight, adjustedLength/2, 
        -width/2, wallHeight, exactBackZ,            
        -adjustedWidth/2, wallHeight, adjustedLength/2,  
        0, wallHeight + roofHeight, exactBackZ,      
        -width/2, wallHeight, exactFrontZ,            
        -adjustedWidth/2, wallHeight, -adjustedLength/2, 
        -width/2, wallHeight, exactBackZ,             
        
        -adjustedWidth/2, wallHeight, -adjustedLength/2, 
        -adjustedWidth/2, wallHeight, adjustedLength/2, 
        -width/2, wallHeight, exactBackZ,            
        width/2, wallHeight, exactFrontZ,            
        0, wallHeight + roofHeight, exactFrontZ,      
        adjustedWidth/2, wallHeight, -adjustedLength/2, 
        
        0, wallHeight + roofHeight, exactFrontZ,    
        0, wallHeight + roofHeight, -adjustedLength/2, 
        adjustedWidth/2, wallHeight, -adjustedLength/2,  
        
        width/2, wallHeight, exactFrontZ,            
        width/2, wallHeight, exactBackZ,              
        0, wallHeight + roofHeight, exactFrontZ,    
        
        width/2, wallHeight, exactBackZ,            
        0, wallHeight + roofHeight, exactBackZ,    
        0, wallHeight + roofHeight, exactFrontZ,
        0, wallHeight + roofHeight, exactBackZ,       
        0, wallHeight + roofHeight, adjustedLength/2,   
        adjustedWidth/2, wallHeight, adjustedLength/2,
        width/2, wallHeight, exactBackZ,             
        adjustedWidth/2, wallHeight, adjustedLength/2,  
        0, wallHeight + roofHeight, exactBackZ,
        width/2, wallHeight, exactFrontZ,           
        adjustedWidth/2, wallHeight, -adjustedLength/2, 
        width/2, wallHeight, exactBackZ,             
        adjustedWidth/2, wallHeight, -adjustedLength/2,  
        adjustedWidth/2, wallHeight, adjustedLength/2,   
        width/2, wallHeight, exactBackZ              
      ]);
      roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const vertexCount = vertices.length / 3;
const uvs = [];
for (let i = 0; i < vertexCount; i += 3) {
  uvs.push(0, 0);
  uvs.push(1, 0);   
  uvs.push(0.5, 1); 
}

roofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
      roofGeometry.computeVertexNormals();
      const gableRoof = new THREE.Mesh(roofGeometry, roofMaterial);
      houseGroup.add(gableRoof);
      const frontWallMaterial = this.getWallMaterial('MainFront');
      const backWallMaterial = this.getWallMaterial('MainBack');
      const frontGableGeometry = new THREE.BufferGeometry();
      const frontGableVertices = new Float32Array([
        -width/2, wallHeight, -length/2,           
        width/2, wallHeight, -length/2,          
        0, wallHeight + roofHeight, -length/2,    
      ]);
      
      frontGableGeometry.setAttribute('position', new THREE.BufferAttribute(frontGableVertices, 3));
      frontGableGeometry.setIndex([0, 1, 2]);
      frontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
        0, 0,   
        1, 0,   
        0.5, 1
      ]), 2));
      frontGableGeometry.computeVertexNormals();
      
      const frontGable = new THREE.Mesh(frontGableGeometry, frontWallMaterial);
      frontGable.name = "FrontGable";
      houseGroup.add(frontGable);
      const backGableGeometry = new THREE.BufferGeometry();
      const backGableVertices = new Float32Array([
        -width/2, wallHeight, length/2,     
        width/2, wallHeight, length/2,          
        0, wallHeight + roofHeight, length/2,    
      ]);
      
      backGableGeometry.setAttribute('position', new THREE.BufferAttribute(backGableVertices, 3));
      backGableGeometry.setIndex([2, 1, 0]);
      backGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
        0, 0,  
        1, 0,  
        0.5, 1  
      ]), 2));
      
      backGableGeometry.computeVertexNormals();
      const backGable = new THREE.Mesh(backGableGeometry, backWallMaterial);
      backGable.name = "BackGable";
      houseGroup.add(backGable);
      
      const edgesGeometry = new THREE.EdgesGeometry(roofGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000, 
        linewidth: 1.5,
        transparent: true,
        opacity: 0.7
      });
      
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.position.y += 0.01;
      houseGroup.add(edges);
      
      const ridgeLineGeometry = new THREE.BufferGeometry();
      
      const ridgePoints = new Float32Array([
        0, wallHeight + roofHeight, -length/2,         
        0, wallHeight + roofHeight, length/2,           
        
        0, wallHeight + roofHeight, -length/2,          
        0, wallHeight + roofHeight, -adjustedLength/2,  
        
        0, wallHeight + roofHeight, length/2,          
        0, wallHeight + roofHeight, adjustedLength/2,   
      ]);
      
      ridgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(ridgePoints, 3));
      
      const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x222222,
        linewidth: 2,
        transparent: true,
        opacity: 0.9
      });
      
      const ridgeLines = new THREE.LineSegments(ridgeLineGeometry, ridgeLineMaterial);
      ridgeLines.position.y += 0.02; 
      houseGroup.add(ridgeLines);
    }
  
  private createHipRoof(width: number, length: number, wallHeight: number, material: THREE.Material, houseGroup: THREE.Group): void {
    const roofMargin = 0.5;
    const adjustedWidth = width + roofMargin * 2;
    const adjustedLength = length + roofMargin * 2;
    
    const roofHeight = Math.min(adjustedWidth, adjustedLength) / 4;
    const ridgeLength = adjustedLength * 0.6; 
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -adjustedWidth/2, wallHeight, -adjustedLength/2,  
      adjustedWidth/2, wallHeight, -adjustedLength/2,  
      adjustedWidth/2, wallHeight, adjustedLength/2,    
      -adjustedWidth/2, wallHeight, adjustedLength/2,  
      
      0, wallHeight + roofHeight, -ridgeLength/2,      
      0, wallHeight + roofHeight, ridgeLength/2,        
    ]);
    
    const indices = [
      0, 1, 4,
      1, 2, 5,
      1, 5, 4,
      2, 3, 5,
      
      3, 0, 4,
      3, 4, 5
    ];
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
const hipUvs = [];
for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i];
  const z = vertices[i + 2];
  
  const u = (x + adjustedWidth/2) / adjustedWidth;
  const v = (z + adjustedLength/2) / adjustedLength;
  
  hipUvs.push(u, v);
}

geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(hipUvs), 2));
    geometry.computeVertexNormals();
    
    const hipRoof = new THREE.Mesh(geometry, material);
    
    houseGroup.add(hipRoof);
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      linewidth: 1.5,
      transparent: true,
      opacity: 0.7
    });
    
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    edges.position.y += 0.01;
    houseGroup.add(edges);
    
    const ridgeLineGeometry = new THREE.BufferGeometry();
    
    const ridgePoints = new Float32Array([
      0, wallHeight + roofHeight, -ridgeLength/2,  
      0, wallHeight + roofHeight, ridgeLength/2,   
      
      -adjustedWidth/2, wallHeight, -adjustedLength/2, 
      0, wallHeight + roofHeight, -ridgeLength/2,     
      
      adjustedWidth/2, wallHeight, -adjustedLength/2,  
      0, wallHeight + roofHeight, -ridgeLength/2,     
      
      adjustedWidth/2, wallHeight, adjustedLength/2,   
      0, wallHeight + roofHeight, ridgeLength/2,      
      
      -adjustedWidth/2, wallHeight, adjustedLength/2,  
      0, wallHeight + roofHeight, ridgeLength/2,       
    ]);
    
    ridgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(ridgePoints, 3));
    
    const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x222222,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    
    const ridgeLines = new THREE.LineSegments(ridgeLineGeometry, ridgeLineMaterial);
    ridgeLines.position.y += 0.02; 
    houseGroup.add(ridgeLines);
  }

  private getWallMaterial(wallPosition: string): THREE.MeshStandardMaterial {
    if (!this.houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0x33ccff, side: THREE.DoubleSide });
    }
    
    if (this.houseSpecs.materialCustomizations) {
      try {
        const customizations = JSON.parse(this.houseSpecs.materialCustomizations);
        if (customizations[wallPosition]) {
          return this.materialService.createMaterial(customizations[wallPosition]);
        }
      } catch (e) {
        console.error('Error parsing material customizations:', e);
      }
    }
        return this.materialService.createMaterial(this.houseSpecs.wallMaterial);
  }
  
  private getRoofMaterial(): THREE.MeshStandardMaterial {
    if (!this.houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0xff5500, side: THREE.DoubleSide });
    }
    
    return this.materialService.createMaterial(this.houseSpecs.roofMaterial);
  }
  
  private getFloorMaterial(): THREE.MeshStandardMaterial {
    if (!this.houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    }
    
    return this.materialService.createMaterial(this.houseSpecs.floorMaterial);
  }
}