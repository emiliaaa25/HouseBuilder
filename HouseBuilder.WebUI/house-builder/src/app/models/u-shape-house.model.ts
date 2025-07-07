import * as THREE from 'three';
import { MaterialService } from '../services/material.service';
import { HouseSpecifications, RoofType } from './houseSpecifications.model';
import { HouseFactoryService } from '../services/house-factory.service';
import { Floor } from './floor.model';

export class UShapeHouseModel {
  constructor(
    private houseSpecs: HouseSpecifications,
    private materialService: MaterialService,
    private houseFactory: HouseFactoryService
  ) { }
  
  build(houseGroup: THREE.Group): void {
    const shapeParams = (this.houseSpecs as any).shapeParameters || {};
    const baseLength = shapeParams.BaseLength || 10;
    const baseWidth = shapeParams.BaseWidth || 4;
    const leftWingLength = shapeParams.LeftWingLength || 6;
    const leftWingWidth = shapeParams.LeftWingWidth || 4;
    const rightWingLength = shapeParams.RightWingLength || 6;
    const rightWingWidth = shapeParams.RightWingWidth || 4;
    const height = this.houseFactory.calculateTotalHeight(this.houseSpecs);  
    const floors = this.houseSpecs.floors || [];  
    
    const wallsGroup = new THREE.Group();
    
    this.createWalls(wallsGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, height);
    
    this.createFloors(wallsGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth);
    
    houseGroup.add(wallsGroup);
    
    this.addRoof(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, height);
    
    if (floors && floors.length > 1) {
      this.addFloorBands(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, floors);
    }
  }
  
  private createWalls(
    wallsGroup: THREE.Group,
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number,
    height: number
  ): void {
    const baseFrontWall = new THREE.BoxGeometry(baseLength, height, 0.2);
    const baseFrontWallMaterial = this.getWallMaterial('MainFront');
    const baseFrontWallMesh = new THREE.Mesh(baseFrontWall, baseFrontWallMaterial);
    baseFrontWallMesh.position.set(baseLength/2, height/2, 0);
    wallsGroup.add(baseFrontWallMesh);
    const baseBackWall = new THREE.BoxGeometry(baseLength, height, 0.2);
    const baseBackWallMaterial = this.getWallMaterial('MainBack');
    const baseBackWallMesh = new THREE.Mesh(baseBackWall, baseBackWallMaterial);
    baseBackWallMesh.position.set(baseLength/2, height/2, baseWidth);
    wallsGroup.add(baseBackWallMesh);
    const leftWingLeftWall = new THREE.BoxGeometry(0.2, height, leftWingLength);
    const leftWingLeftWallMaterial = this.getWallMaterial('LeftWingLeft');
    const leftWingLeftWallMesh = new THREE.Mesh(leftWingLeftWall, leftWingLeftWallMaterial);
    leftWingLeftWallMesh.position.set(0, height/2, baseWidth + leftWingLength/2);
    wallsGroup.add(leftWingLeftWallMesh);
    const leftWingFrontWall = new THREE.BoxGeometry(leftWingWidth, height, 0.2);
    const leftWingFrontWallMaterial = this.getWallMaterial('LeftWingFront');
    const leftWingFrontWallMesh = new THREE.Mesh(leftWingFrontWall, leftWingFrontWallMaterial);
    leftWingFrontWallMesh.position.set(leftWingWidth/2, height/2, baseWidth + leftWingLength);
    wallsGroup.add(leftWingFrontWallMesh);
    const leftWingInnerWall = new THREE.BoxGeometry(0.2, height, leftWingLength);
    const leftWingInnerWallMaterial = this.getWallMaterial('LeftWingBack');
    const leftWingInnerWallMesh = new THREE.Mesh(leftWingInnerWall, leftWingInnerWallMaterial);
    leftWingInnerWallMesh.position.set(leftWingWidth, height/2, baseWidth + leftWingLength/2);
    wallsGroup.add(leftWingInnerWallMesh);

    const rightWingRightWall = new THREE.BoxGeometry(0.2, height, rightWingLength);
    const rightWingRightWallMaterial = this.getWallMaterial('RightWingRight');
    const rightWingRightWallMesh = new THREE.Mesh(rightWingRightWall, rightWingRightWallMaterial);
    rightWingRightWallMesh.position.set(baseLength, height/2, baseWidth + rightWingLength/2);
    wallsGroup.add(rightWingRightWallMesh);
    const rightWingFrontWall = new THREE.BoxGeometry(rightWingWidth, height, 0.2);
    const rightWingFrontWallMaterial = this.getWallMaterial('RightWingFront');
    const rightWingFrontWallMesh = new THREE.Mesh(rightWingFrontWall, rightWingFrontWallMaterial);
    rightWingFrontWallMesh.position.set(baseLength - rightWingWidth/2, height/2, baseWidth + rightWingLength);
    wallsGroup.add(rightWingFrontWallMesh);

    const rightWingInnerWall = new THREE.BoxGeometry(0.2, height, rightWingLength);
    const rightWingInnerWallMaterial = this.getWallMaterial('RightWingBack');
    const rightWingInnerWallMesh = new THREE.Mesh(rightWingInnerWall, rightWingInnerWallMaterial);
    rightWingInnerWallMesh.position.set(baseLength - rightWingWidth, height/2, baseWidth + rightWingLength/2);
    wallsGroup.add(rightWingInnerWallMesh);
    const baseLeftWall = new THREE.BoxGeometry(0.2, height, baseWidth);
    const baseLeftWallMaterial = this.getWallMaterial('MainLeft');
    const baseLeftWallMesh = new THREE.Mesh(baseLeftWall, baseLeftWallMaterial);
    baseLeftWallMesh.position.set(0, height/2, baseWidth/2);
    wallsGroup.add(baseLeftWallMesh);
    const baseRightWall = new THREE.BoxGeometry(0.2, height, baseWidth);
    const baseRightWallMaterial = this.getWallMaterial('MainRight');
    const baseRightWallMesh = new THREE.Mesh(baseRightWall, baseRightWallMaterial);
    baseRightWallMesh.position.set(baseLength, height/2, baseWidth/2);
    wallsGroup.add(baseRightWallMesh);
  }

  private createFloors(
    wallsGroup: THREE.Group, 
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number
  ): void {
    const floorMaterial = this.getFloorMaterial();
    const baseFloorGeometry = new THREE.PlaneGeometry(baseLength, baseWidth);
    const baseFloor = new THREE.Mesh(baseFloorGeometry, floorMaterial);
    baseFloor.rotation.x = -Math.PI/2; 
    baseFloor.position.set(baseLength/2, 0.1, baseWidth/2);
    wallsGroup.add(baseFloor);
    const leftWingFloorGeometry = new THREE.PlaneGeometry(leftWingWidth, leftWingLength);
    const leftWingFloor = new THREE.Mesh(leftWingFloorGeometry, floorMaterial);
    leftWingFloor.rotation.x = -Math.PI/2; 
    leftWingFloor.position.set(leftWingWidth/2, 0.1, baseWidth + leftWingLength/2);
    wallsGroup.add(leftWingFloor);
    const rightWingFloorGeometry = new THREE.PlaneGeometry(rightWingWidth, rightWingLength);
    const rightWingFloor = new THREE.Mesh(rightWingFloorGeometry, floorMaterial);
    rightWingFloor.rotation.x = -Math.PI/2; 
    rightWingFloor.position.set(baseLength - rightWingWidth/2, 0.1, baseWidth + rightWingLength/2);
    wallsGroup.add(rightWingFloor);
  }
 
  private addFloorBands(
    houseGroup: THREE.Group,
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number,
    floors: Floor[]
  ): void {
    const sortedFloors = [...floors].sort((a, b) => a.index - b.index);
    
    const bandMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1.0
    });
    
    let currentHeight = 0;
    
    for (let i = 0; i < sortedFloors.length - 1; i++) {
      currentHeight += sortedFloors[i].floorHeigth;
      
      const bandThickness = 0.08;
      const bandHeight = 0.08;
      const offset = 0.09;
      const baseFrontBand = new THREE.BoxGeometry(baseLength, bandHeight, bandThickness);
      const baseFrontBandMesh = new THREE.Mesh(baseFrontBand, bandMaterial);
      baseFrontBandMesh.position.set(baseLength/2, currentHeight, 0 - offset);
      baseFrontBandMesh.name = `FloorBand_${i+1}_MainFront`;
      houseGroup.add(baseFrontBandMesh);
      
      const baseBackBand = new THREE.BoxGeometry(baseLength, bandHeight, bandThickness);
      const baseBackBandMesh = new THREE.Mesh(baseBackBand, bandMaterial);
      baseBackBandMesh.position.set(baseLength/2, currentHeight, baseWidth + offset);
      baseBackBandMesh.name = `FloorBand_${i+1}_MainBack`;
      houseGroup.add(baseBackBandMesh);
      const baseLeftBand = new THREE.BoxGeometry(bandThickness, bandHeight, baseWidth);
      const baseLeftBandMesh = new THREE.Mesh(baseLeftBand, bandMaterial);
      baseLeftBandMesh.position.set(0 - offset, currentHeight, baseWidth/2);
      baseLeftBandMesh.name = `FloorBand_${i+1}_MainLeft`;
      houseGroup.add(baseLeftBandMesh);
      const baseRightBand = new THREE.BoxGeometry(bandThickness, bandHeight, baseWidth);
      const baseRightBandMesh = new THREE.Mesh(baseRightBand, bandMaterial);
      baseRightBandMesh.position.set(baseLength + offset, currentHeight, baseWidth/2);
      baseRightBandMesh.name = `FloorBand_${i+1}_MainRight`;
      houseGroup.add(baseRightBandMesh);
      const leftWingLeftBand = new THREE.BoxGeometry(bandThickness, bandHeight, leftWingLength);
      const leftWingLeftBandMesh = new THREE.Mesh(leftWingLeftBand, bandMaterial);
      leftWingLeftBandMesh.position.set(0 - offset, currentHeight, baseWidth + leftWingLength/2);
      leftWingLeftBandMesh.name = `FloorBand_${i+1}_LeftWingLeft`;
      houseGroup.add(leftWingLeftBandMesh);
      
      const leftWingFrontBand = new THREE.BoxGeometry(leftWingWidth, bandHeight, bandThickness);
      const leftWingFrontBandMesh = new THREE.Mesh(leftWingFrontBand, bandMaterial);
      leftWingFrontBandMesh.position.set(leftWingWidth/2, currentHeight, baseWidth + leftWingLength + offset);
      leftWingFrontBandMesh.name = `FloorBand_${i+1}_LeftWingFront`;
      houseGroup.add(leftWingFrontBandMesh);
      const leftWingBackBand = new THREE.BoxGeometry(leftWingWidth, bandHeight, bandThickness);
      const leftWingBackBandMesh = new THREE.Mesh(leftWingBackBand, bandMaterial);
      leftWingBackBandMesh.position.set(leftWingWidth/2, currentHeight, baseWidth + offset);
      leftWingBackBandMesh.name = `FloorBand_${i+1}_LeftWingBack`;
      houseGroup.add(leftWingBackBandMesh);
      const rightWingRightBand = new THREE.BoxGeometry(bandThickness, bandHeight, rightWingLength);
      const rightWingRightBandMesh = new THREE.Mesh(rightWingRightBand, bandMaterial);
      rightWingRightBandMesh.position.set(baseLength + offset, currentHeight, baseWidth + rightWingLength/2);
      rightWingRightBandMesh.name = `FloorBand_${i+1}_RightWingRight`;
      houseGroup.add(rightWingRightBandMesh);
      const rightWingFrontBand = new THREE.BoxGeometry(rightWingWidth, bandHeight, bandThickness);
      const rightWingFrontBandMesh = new THREE.Mesh(rightWingFrontBand, bandMaterial);
      rightWingFrontBandMesh.position.set(baseLength - rightWingWidth/2, currentHeight, baseWidth + rightWingLength + offset);
      rightWingFrontBandMesh.name = `FloorBand_${i+1}_RightWingFront`;
      houseGroup.add(rightWingFrontBandMesh);
      
      const rightWingBackBand = new THREE.BoxGeometry(rightWingWidth, bandHeight, bandThickness);
      const rightWingBackBandMesh = new THREE.Mesh(rightWingBackBand, bandMaterial);
      rightWingBackBandMesh.position.set(baseLength - rightWingWidth/2, currentHeight, baseWidth + offset);
      rightWingBackBandMesh.name = `FloorBand_${i+1}_RightWingBack`;
      houseGroup.add(rightWingBackBandMesh);
      const leftWingInnerBand = new THREE.BoxGeometry(bandThickness, bandHeight, leftWingLength);
      const leftWingInnerBandMesh = new THREE.Mesh(leftWingInnerBand, bandMaterial);
      leftWingInnerBandMesh.position.set(leftWingWidth + offset, currentHeight, baseWidth + leftWingLength/2);
      leftWingInnerBandMesh.name = `FloorBand_${i+1}_LeftWingInner`;
      houseGroup.add(leftWingInnerBandMesh);
      const rightWingInnerBand = new THREE.BoxGeometry(bandThickness, bandHeight, rightWingLength);
      const rightWingInnerBandMesh = new THREE.Mesh(rightWingInnerBand, bandMaterial);
      rightWingInnerBandMesh.position.set(baseLength - rightWingWidth - offset, currentHeight, baseWidth + rightWingLength/2);
      rightWingInnerBandMesh.name = `FloorBand_${i+1}_RightWingInner`;
      houseGroup.add(rightWingInnerBandMesh);
    }
  }

  private addRoof(
    houseGroup: THREE.Group, 
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number,
    wallHeight: number
  ): void {
    const roofMaterial = this.getRoofMaterial();
    
    switch (this.houseSpecs.roofType) {
      case RoofType.Flat:
        this.addFlatRoof(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, wallHeight, roofMaterial);
        break;
      case RoofType.Gable:
        this.addGableRoof(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, wallHeight, roofMaterial);
        break;    
      case RoofType.Hip:
        this.addHipRoof(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, wallHeight, roofMaterial);
        break;
      default:
        this.addFlatRoof(houseGroup, baseLength, baseWidth, leftWingLength, leftWingWidth, rightWingLength, rightWingWidth, wallHeight, roofMaterial);
    }
  }
  
  private addFlatRoof(
    houseGroup: THREE.Group, 
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number,
    wallHeight: number, 
    material: THREE.Material
  ): void {
    const baseRoofGeometry = new THREE.BoxGeometry(baseLength + 0.4, 0.2, baseWidth + 0.4);
    const baseRoof = new THREE.Mesh(baseRoofGeometry, material);
    baseRoof.position.set(baseLength/2, wallHeight + 0.1, baseWidth/2);
    houseGroup.add(baseRoof);
    const leftWingRoofGeometry = new THREE.BoxGeometry(leftWingWidth + 0.4, 0.2, leftWingLength + 0.4);
    const leftWingRoof = new THREE.Mesh(leftWingRoofGeometry, material);
    leftWingRoof.position.set(leftWingWidth/2, wallHeight + 0.1, baseWidth + leftWingLength/2);
    houseGroup.add(leftWingRoof);

    const rightWingRoofGeometry = new THREE.BoxGeometry(rightWingWidth + 0.4, 0.2, rightWingLength + 0.4);
    const rightWingRoof = new THREE.Mesh(rightWingRoofGeometry, material);
    rightWingRoof.position.set(baseLength - rightWingWidth/2, wallHeight + 0.1, baseWidth + rightWingLength/2);
    houseGroup.add(rightWingRoof);
  }

  private addGableRoof(
  houseGroup: THREE.Group,
  baseLength: number,
  baseWidth: number,
  leftWingLength: number,
  leftWingWidth: number,
  rightWingLength: number,
  rightWingWidth: number,
  wallHeight: number,
  material: THREE.Material
): void {
  const roofMargin = 0.5;
  
  const baseRoofHeight = baseWidth / 3.5; 
  const leftWingRoofHeight = leftWingWidth / 3.5;  
  const rightWingRoofHeight = rightWingWidth / 3.5; 
  const baseCenterX = baseLength/2;
  const baseCenterZ = baseWidth/2;
  const baseRoofGeometry = new THREE.BufferGeometry();
  
  const baseVertices = new Float32Array([
    -baseLength/2, 0, -baseWidth/2,    
    baseLength/2, 0, -baseWidth/2,      
    baseLength/2, 0, baseWidth/2,       
    -baseLength/2, 0, baseWidth/2,     
    
    -(baseLength/2 + roofMargin), 0, -baseWidth/2 - roofMargin, 
    (baseLength/2 + roofMargin), 0, -baseWidth/2 - roofMargin,  
    (baseLength/2 + roofMargin), 0, baseWidth/2 + roofMargin,   
    -(baseLength/2 + roofMargin), 0, baseWidth/2 + roofMargin,   
    0, baseRoofHeight, -baseWidth/2,            
    0, baseRoofHeight, baseWidth/2,            
    0, baseRoofHeight, -baseWidth/2 - roofMargin,
    0, baseRoofHeight, baseWidth/2 + roofMargin,  
  ]);
  const baseIndices = [
  
    0, 8, 3,
    3, 8, 9,
    1, 2, 8,
    2, 9, 8,
    0, 4, 8,
    4, 10, 8,
    1, 8, 5,
    5, 8, 10,
    3, 9, 7,
    7, 9, 11,
    2, 6, 9,
    6, 11, 9,
    0, 3, 4,
    3, 7, 4,
    1, 5, 2,
    2, 5, 6
  ];
  
  baseRoofGeometry.setAttribute('position', new THREE.BufferAttribute(baseVertices, 3));
  baseRoofGeometry.setIndex(baseIndices);
  const baseVertexCount = baseVertices.length / 3;
const baseUvs = [];

for (let i = 0; i < baseVertexCount; i += 3) {
  baseUvs.push(0, 0);    
  baseUvs.push(1, 0);   
  baseUvs.push(0.5, 1); 
}

baseRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(baseUvs), 2));

  baseRoofGeometry.computeVertexNormals();
  
  const baseRoof = new THREE.Mesh(baseRoofGeometry, material);
  baseRoof.name = "BaseGableRoof";
  baseRoof.position.set(baseCenterX, wallHeight, baseCenterZ);
  houseGroup.add(baseRoof);
  
  const frontWallMaterial = this.getWallMaterial('MainFront');
  const backWallMaterial = this.getWallMaterial('MainBack');
  
  const baseFrontGableGeometry = new THREE.BufferGeometry();
  const baseFrontGableVertices = new Float32Array([
    -baseLength/2, 0, -baseWidth/2,   
    baseLength/2, 0, -baseWidth/2,   
    0, baseRoofHeight, -baseWidth/2 
  ]);
  
  baseFrontGableGeometry.setAttribute('position', new THREE.BufferAttribute(baseFrontGableVertices, 3));
  baseFrontGableGeometry.setIndex([0, 1, 2]);
  baseFrontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  baseFrontGableGeometry.computeVertexNormals();
  
  const baseFrontGable = new THREE.Mesh(baseFrontGableGeometry, frontWallMaterial);
  baseFrontGable.name = "BaseFrontGable";
  baseFrontGable.position.set(baseCenterX, wallHeight, baseCenterZ);
  houseGroup.add(baseFrontGable);
  
  const baseBackGableGeometry = new THREE.BufferGeometry();
  const baseBackGableVertices = new Float32Array([
    -baseLength/2, 0, baseWidth/2,   
    baseLength/2, 0, baseWidth/2,    
    0, baseRoofHeight, baseWidth/2 
  ]);
  
  baseBackGableGeometry.setAttribute('position', new THREE.BufferAttribute(baseBackGableVertices, 3));
  baseBackGableGeometry.setIndex([2, 1, 0]);
  baseBackGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  baseBackGableGeometry.computeVertexNormals();
  
  const baseBackGable = new THREE.Mesh(baseBackGableGeometry, backWallMaterial);
  baseBackGable.name = "BaseBackGable";
  baseBackGable.position.set(baseCenterX, wallHeight, baseCenterZ);
  houseGroup.add(baseBackGable);
  const leftWingCenterX = leftWingWidth/2;
  const leftWingCenterZ = baseWidth + leftWingLength/2;
  
  const leftWingRoofGeometry = new THREE.BufferGeometry();
  
  const leftWingVertices = new Float32Array([
    -leftWingWidth/2, 0, -leftWingLength/2,  
    leftWingWidth/2, 0, -leftWingLength/2,     
    leftWingWidth/2, 0, leftWingLength/2, 
    -leftWingWidth/2, 0, leftWingLength/2,   
    
    -(leftWingWidth/2 + roofMargin), 0, -leftWingLength/2 - roofMargin, 
    (leftWingWidth/2 + roofMargin), 0, -leftWingLength/2 - roofMargin,   
    (leftWingWidth/2), 0, leftWingLength/2 + roofMargin,   
    -(leftWingWidth/2 + roofMargin), 0, leftWingLength/2 + roofMargin, 
    
    0, leftWingRoofHeight, -leftWingLength/2,            
    0, leftWingRoofHeight, leftWingLength/2,             
    0, leftWingRoofHeight, -leftWingLength/2 - roofMargin,  
    0, leftWingRoofHeight, leftWingLength/2 + roofMargin,   
  ]);
  
  const leftWingIndices = [
    0, 8, 3, 3, 8, 9,
    1, 2, 8, 2, 9, 8,
    0, 4, 8, 4, 10, 8,
    1, 8, 5, 5, 8, 10,
    3, 9, 7, 7, 9, 11,
    2, 6, 9, 6, 11, 9,
    0, 3, 4, 3, 7, 4
  ];
  
  leftWingRoofGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
  leftWingRoofGeometry.setIndex(leftWingIndices);
  const leftWingVertexCount = leftWingVertices.length / 3;
const leftWingUvs = [];

for (let i = 0; i < leftWingVertexCount; i += 3) {
  leftWingUvs.push(0, 0);    
  leftWingUvs.push(1, 0);    
  leftWingUvs.push(0.5, 1);
}

leftWingRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(leftWingUvs), 2));

  leftWingRoofGeometry.computeVertexNormals();
  
  const leftWingRoof = new THREE.Mesh(leftWingRoofGeometry, material);
  leftWingRoof.name = "LeftWingGableRoof";
  leftWingRoof.position.set(leftWingCenterX, wallHeight, leftWingCenterZ);
  houseGroup.add(leftWingRoof);
  
  const leftWingFrontGableGeometry = new THREE.BufferGeometry();
  const leftWingFrontGableVertices = new Float32Array([
    -leftWingWidth/2, 0, -leftWingLength/2,
    leftWingWidth/2, 0, -leftWingLength/2,
    0, leftWingRoofHeight, -leftWingLength/2
  ]);
  
  leftWingFrontGableGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingFrontGableVertices, 3));
  leftWingFrontGableGeometry.setIndex([0, 1, 2]);
  leftWingFrontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  leftWingFrontGableGeometry.computeVertexNormals();
  
  const leftWingFrontGable = new THREE.Mesh(leftWingFrontGableGeometry, this.getWallMaterial('LeftWingBack'));
  leftWingFrontGable.name = "LeftWingFrontGable";
  leftWingFrontGable.position.set(leftWingCenterX, wallHeight, leftWingCenterZ);
  houseGroup.add(leftWingFrontGable);
  
  const leftWingBackGableGeometry = new THREE.BufferGeometry();
  const leftWingBackGableVertices = new Float32Array([
    -leftWingWidth/2, 0, leftWingLength/2,
    leftWingWidth/2, 0, leftWingLength/2,
    0, leftWingRoofHeight, leftWingLength/2
  ]);
  
  leftWingBackGableGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingBackGableVertices, 3));
  leftWingBackGableGeometry.setIndex([2, 1, 0]);
  leftWingBackGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  leftWingBackGableGeometry.computeVertexNormals();
  
  const leftWingBackGable = new THREE.Mesh(leftWingBackGableGeometry, this.getWallMaterial('LeftWingFront'));
  leftWingBackGable.name = "LeftWingBackGable";
  leftWingBackGable.position.set(leftWingCenterX, wallHeight, leftWingCenterZ);
  houseGroup.add(leftWingBackGable);
  
  const rightWingCenterX = baseLength - rightWingWidth/2;
  const rightWingCenterZ = baseWidth + rightWingLength/2;
  
  const rightWingRoofGeometry = new THREE.BufferGeometry();
  
  const rightWingVertices = new Float32Array([
    -rightWingWidth/2, 0, -rightWingLength/2,      
    rightWingWidth/2, 0, -rightWingLength/2,      
    rightWingWidth/2, 0, rightWingLength/2,       
    -rightWingWidth/2, 0, rightWingLength/2,      
    (-rightWingWidth/2), 0, -rightWingLength/2 - roofMargin,  
    (rightWingWidth/2 + roofMargin), 0, -rightWingLength/2 - roofMargin,  
    (rightWingWidth/2 + roofMargin), 0, rightWingLength/2 + roofMargin,   
    -(rightWingWidth/2), 0, rightWingLength/2 + roofMargin,  
    
    0, rightWingRoofHeight, -rightWingLength/2,             
    0, rightWingRoofHeight, rightWingLength/2,              
    0, rightWingRoofHeight, -rightWingLength/2 - roofMargin,  
    0, rightWingRoofHeight, rightWingLength/2 + roofMargin,   
  ]);
  
  const rightWingIndices = [

    0, 8, 3, 3, 8, 9,

    1, 2, 8, 2, 9, 8,

    0, 4, 8, 4, 10, 8,
    1, 8, 5, 5, 8, 10,
    3, 9, 7, 7, 9, 11,
    2, 6, 9, 6, 11, 9,

    1, 2, 5, 2, 6, 5
  ];
  
  rightWingRoofGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
  rightWingRoofGeometry.setIndex(rightWingIndices);
  const rightWingVertexCount = rightWingVertices.length / 3;
const rightWingUvs = [];

for (let i = 0; i < rightWingVertexCount; i += 3) {
  rightWingUvs.push(0, 0);   
  rightWingUvs.push(1, 0);   
  rightWingUvs.push(0.5, 1);  
}

rightWingRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(rightWingUvs), 2));

  rightWingRoofGeometry.computeVertexNormals();
  
  const rightWingRoof = new THREE.Mesh(rightWingRoofGeometry, material);
  rightWingRoof.name = "RightWingGableRoof";
  rightWingRoof.position.set(rightWingCenterX, wallHeight, rightWingCenterZ);
  houseGroup.add(rightWingRoof);
  
  const rightWingFrontGableGeometry = new THREE.BufferGeometry();
  const rightWingFrontGableVertices = new Float32Array([
    -rightWingWidth/2, 0, -rightWingLength/2,
    rightWingWidth/2, 0, -rightWingLength/2,
    0, rightWingRoofHeight, -rightWingLength/2
  ]);
  
  rightWingFrontGableGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingFrontGableVertices, 3));
  rightWingFrontGableGeometry.setIndex([0, 1, 2]);
  rightWingFrontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  rightWingFrontGableGeometry.computeVertexNormals();
  
  const rightWingFrontGable = new THREE.Mesh(rightWingFrontGableGeometry, this.getWallMaterial('RightWingBack'));
  rightWingFrontGable.name = "RightWingFrontGable";
  rightWingFrontGable.position.set(rightWingCenterX, wallHeight, rightWingCenterZ);
  houseGroup.add(rightWingFrontGable);
  
  const rightWingBackGableGeometry = new THREE.BufferGeometry();
  const rightWingBackGableVertices = new Float32Array([
    -rightWingWidth/2, 0, rightWingLength/2,
    rightWingWidth/2, 0, rightWingLength/2,
    0, rightWingRoofHeight, rightWingLength/2
  ]);
  
  rightWingBackGableGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingBackGableVertices, 3));
  rightWingBackGableGeometry.setIndex([2, 1, 0]);
  rightWingBackGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0, 1, 0, 0.5, 1
  ]), 2));
  rightWingBackGableGeometry.computeVertexNormals();
  
  const rightWingBackGable = new THREE.Mesh(rightWingBackGableGeometry, this.getWallMaterial('RightWingFront'));
  rightWingBackGable.name = "RightWingBackGable";
  rightWingBackGable.position.set(rightWingCenterX, wallHeight, rightWingCenterZ);
  houseGroup.add(rightWingBackGable);
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  const baseEdgesGeometry = new THREE.EdgesGeometry(baseRoofGeometry);
  const baseEdges = new THREE.LineSegments(baseEdgesGeometry, edgesMaterial);
  baseEdges.position.copy(baseRoof.position);
  baseEdges.position.y += 0.01;
  houseGroup.add(baseEdges);
  
  const leftWingEdgesGeometry = new THREE.EdgesGeometry(leftWingRoofGeometry);
  const leftWingEdges = new THREE.LineSegments(leftWingEdgesGeometry, edgesMaterial);
  leftWingEdges.position.copy(leftWingRoof.position);
  leftWingEdges.position.y += 0.01;
  houseGroup.add(leftWingEdges);
  const rightWingEdgesGeometry = new THREE.EdgesGeometry(rightWingRoofGeometry);
  const rightWingEdges = new THREE.LineSegments(rightWingEdgesGeometry, edgesMaterial);
  rightWingEdges.position.copy(rightWingRoof.position);
  rightWingEdges.position.y += 0.01;
  houseGroup.add(rightWingEdges);
  const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x222222,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  });
  const baseRidgeLineGeometry = new THREE.BufferGeometry();
  const baseRidgePoints = new Float32Array([
    0, baseRoofHeight, -baseWidth/2 - roofMargin, 
    0, baseRoofHeight, -baseWidth/2,               
    0, baseRoofHeight, baseWidth/2,                
    0, baseRoofHeight, baseWidth/2 + roofMargin    
  ]);
  
  baseRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(baseRidgePoints, 3));
  
  const baseRidgeLines = new THREE.LineSegments(baseRidgeLineGeometry, ridgeLineMaterial);
  baseRidgeLines.position.copy(baseRoof.position);
  baseRidgeLines.position.y += 0.02;
  houseGroup.add(baseRidgeLines);
  
  const leftWingRidgeLineGeometry = new THREE.BufferGeometry();
  const leftWingRidgePoints = new Float32Array([
    0, leftWingRoofHeight, -leftWingLength/2 - roofMargin,  
    0, leftWingRoofHeight, -leftWingLength/2,              
    0, leftWingRoofHeight, leftWingLength/2,                
    0, leftWingRoofHeight, leftWingLength/2 + roofMargin   
  ]);
  
  leftWingRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingRidgePoints, 3));
  
  const leftWingRidgeLines = new THREE.LineSegments(leftWingRidgeLineGeometry, ridgeLineMaterial);
  leftWingRidgeLines.position.copy(leftWingRoof.position);
  leftWingRidgeLines.position.y += 0.02;
  houseGroup.add(leftWingRidgeLines);
  
  const rightWingRidgeLineGeometry = new THREE.BufferGeometry();
  const rightWingRidgePoints = new Float32Array([
    0, rightWingRoofHeight, -rightWingLength/2 - roofMargin,  
    0, rightWingRoofHeight, -rightWingLength/2,               
    0, rightWingRoofHeight, rightWingLength/2,              
    0, rightWingRoofHeight, rightWingLength/2 + roofMargin  
  ]);
  
  rightWingRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingRidgePoints, 3));
  
  const rightWingRidgeLines = new THREE.LineSegments(rightWingRidgeLineGeometry, ridgeLineMaterial);
  rightWingRidgeLines.position.copy(rightWingRoof.position);
  rightWingRidgeLines.position.y += 0.02;
  houseGroup.add(rightWingRidgeLines);
}
 private addHipRoof(
    houseGroup: THREE.Group,
    baseLength: number,
    baseWidth: number,
    leftWingLength: number,
    leftWingWidth: number,
    rightWingLength: number,
    rightWingWidth: number,
    wallHeight: number,
    material: THREE.Material
  ): void {
    const roofMargin = 0.5;
    const roofHeight = Math.min(baseWidth, leftWingWidth, rightWingWidth) / 4;
    
    const baseRoofGeometry = new THREE.BufferGeometry();
    const adjustedBaseLength = baseLength + roofMargin * 2;
    const adjustedBaseWidth = baseWidth + roofMargin * 2;
    const baseCenterX = baseLength/2;
    const baseCenterZ = baseWidth/2;
    const baseRidgeLength = adjustedBaseLength * 0.6;
    const baseVertices = new Float32Array([
      -adjustedBaseLength/2, 0, -adjustedBaseWidth/2, 
      adjustedBaseLength/2, 0, -adjustedBaseWidth/2,   
      adjustedBaseLength/2, 0, adjustedBaseWidth/2,   
      -adjustedBaseLength/2, 0, adjustedBaseWidth/2,   
      0, roofHeight, -baseRidgeLength/2, 
      0, roofHeight, baseRidgeLength/2,  
    ]);
    const baseIndices = [
      0, 1, 4,
      1, 2, 5,
      1, 5, 4,
      
      2, 3, 5,
      
      3, 0, 4,
      3, 4, 5
    ];
    
    baseRoofGeometry.setAttribute('position', new THREE.BufferAttribute(baseVertices, 3));
    baseRoofGeometry.setIndex(baseIndices);
    const baseHipUvs = [];
for (let i = 0; i < baseVertices.length; i += 3) {
  const x = baseVertices[i];
  const z = baseVertices[i + 2];
  const u = (x + adjustedBaseLength/2) / adjustedBaseLength;
  const v = (z + adjustedBaseWidth/2) / adjustedBaseWidth;
  
  baseHipUvs.push(u, v);
}

baseRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(baseHipUvs), 2));

    baseRoofGeometry.computeVertexNormals();
    
    const baseRoof = new THREE.Mesh(baseRoofGeometry, material);
    baseRoof.name = "BaseHipRoof";
    
    baseRoof.position.set(baseCenterX, wallHeight, baseCenterZ);
    houseGroup.add(baseRoof);
    
    const leftWingRoofGeometry = new THREE.BufferGeometry();
    const adjustedLeftWingWidth = leftWingWidth + roofMargin * 2;
    const adjustedLeftWingLength = leftWingLength + roofMargin * 2;
    
    const leftWingCenterX = leftWingWidth/2;
    const leftWingCenterZ = baseWidth + leftWingLength/2;
    const leftWingRidgeLength = adjustedLeftWingLength * 0.6;
    
    const leftWingVertices = new Float32Array([
      -adjustedLeftWingWidth/2, 0, -adjustedLeftWingLength/2,  
      adjustedLeftWingWidth/2, 0, -adjustedLeftWingLength/2,  
      adjustedLeftWingWidth/2, 0, adjustedLeftWingLength/2,   
      -adjustedLeftWingWidth/2, 0, adjustedLeftWingLength/2,  
      
      0, roofHeight * 0.85, -leftWingRidgeLength/2,  
      0, roofHeight * 0.85, leftWingRidgeLength/2,   
    ]);
    const leftWingIndices = [
      
      0, 1, 4,
      
      1, 2, 5,
      1, 5, 4,
      2, 3, 5,
      3, 0, 4,
      3, 4, 5
    ];
    
    leftWingRoofGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingVertices, 3));
    leftWingRoofGeometry.setIndex(leftWingIndices);
    const leftWingHipUvs = [];

for (let i = 0; i < leftWingVertices.length; i += 3) {
  const x = leftWingVertices[i];
  const z = leftWingVertices[i + 2];
  
  const u = (x + adjustedLeftWingWidth/2) / adjustedLeftWingWidth;
  const v = (z + adjustedLeftWingLength/2) / adjustedLeftWingLength;
  
  leftWingHipUvs.push(u, v);
}

leftWingRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(leftWingHipUvs), 2));

    leftWingRoofGeometry.computeVertexNormals();
    const leftWingRoof = new THREE.Mesh(leftWingRoofGeometry, material);
    leftWingRoof.name = "LeftWingHipRoof";
    leftWingRoof.position.set(leftWingCenterX, wallHeight, leftWingCenterZ);
    houseGroup.add(leftWingRoof);
    const rightWingRoofGeometry = new THREE.BufferGeometry();
    const adjustedRightWingWidth = rightWingWidth + roofMargin * 2;
    const adjustedRightWingLength = rightWingLength + roofMargin * 2;
    const rightWingCenterX = baseLength - rightWingWidth/2;
    const rightWingCenterZ = baseWidth + rightWingLength/2;
    const rightWingRidgeLength = adjustedRightWingLength * 0.6;
    const rightWingVertices = new Float32Array([
      -adjustedRightWingWidth/2, 0, -adjustedRightWingLength/2,  
      adjustedRightWingWidth/2, 0, -adjustedRightWingLength/2,  
      adjustedRightWingWidth/2, 0, adjustedRightWingLength/2,    
      -adjustedRightWingWidth/2, 0, adjustedRightWingLength/2,  
      
      0, roofHeight * 0.85, -rightWingRidgeLength/2,  
      0, roofHeight * 0.85, rightWingRidgeLength/2,   
    ]);
    
    const rightWingIndices = [
      0, 1, 4,
      1, 2, 5,
      1, 5, 4,
      
      2, 3, 5,
      3, 0, 4,
      3, 4, 5
    ];
    
    rightWingRoofGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
    rightWingRoofGeometry.setIndex(rightWingIndices);
    const rightWingHipUvs = [];

for (let i = 0; i < rightWingVertices.length; i += 3) {
  const x = rightWingVertices[i];
  const z = rightWingVertices[i + 2];
  const u = (x + adjustedRightWingWidth/2) / adjustedRightWingWidth;
  const v = (z + adjustedRightWingLength/2) / adjustedRightWingLength;
  
  rightWingHipUvs.push(u, v);
}

rightWingRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(rightWingHipUvs), 2));
    rightWingRoofGeometry.computeVertexNormals();
    const rightWingRoof = new THREE.Mesh(rightWingRoofGeometry, material);
    rightWingRoof.name = "RightWingHipRoof";
    rightWingRoof.position.set(rightWingCenterX, wallHeight, rightWingCenterZ);
    houseGroup.add(rightWingRoof);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000, 
      linewidth: 1.5,
      transparent: true,
      opacity: 0.7
    });
    
    const baseEdgesGeometry = new THREE.EdgesGeometry(baseRoofGeometry);
    const baseEdges = new THREE.LineSegments(baseEdgesGeometry, edgesMaterial);
    baseEdges.position.copy(baseRoof.position);
    baseEdges.position.y += 0.01;
    houseGroup.add(baseEdges);
    const leftWingEdgesGeometry = new THREE.EdgesGeometry(leftWingRoofGeometry);
    const leftWingEdges = new THREE.LineSegments(leftWingEdgesGeometry, edgesMaterial);
    leftWingEdges.position.copy(leftWingRoof.position);
    leftWingEdges.position.y += 0.01;
    houseGroup.add(leftWingEdges);
    
    const rightWingEdgesGeometry = new THREE.EdgesGeometry(rightWingRoofGeometry);
    const rightWingEdges = new THREE.LineSegments(rightWingEdgesGeometry, edgesMaterial);
    rightWingEdges.position.copy(rightWingRoof.position);
    rightWingEdges.position.y += 0.01;
    houseGroup.add(rightWingEdges);
    
    const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x222222,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    
    const baseRidgeLineGeometry = new THREE.BufferGeometry();
    const baseRidgePoints = new Float32Array([
      0, roofHeight, -baseRidgeLength/2, 
      0, roofHeight, baseRidgeLength/2    
    ]);
    
    baseRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(baseRidgePoints, 3));
    
    const baseRidgeLines = new THREE.LineSegments(baseRidgeLineGeometry, ridgeLineMaterial);
    baseRidgeLines.position.copy(baseRoof.position);
    baseRidgeLines.position.y += 0.02; 
    houseGroup.add(baseRidgeLines);
    
    const leftWingRidgeLineGeometry = new THREE.BufferGeometry();
    const leftWingRidgePoints = new Float32Array([
      0, roofHeight * 0.85, -leftWingRidgeLength/2,  
      0, roofHeight * 0.85, leftWingRidgeLength/2   
    ]);
    
    leftWingRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(leftWingRidgePoints, 3));
    
    const leftWingRidgeLines = new THREE.LineSegments(leftWingRidgeLineGeometry, ridgeLineMaterial);
    leftWingRidgeLines.position.copy(leftWingRoof.position);
    leftWingRidgeLines.position.y += 0.02;
    houseGroup.add(leftWingRidgeLines);
    
    const rightWingRidgeLineGeometry = new THREE.BufferGeometry();
    const rightWingRidgePoints = new Float32Array([
      0, roofHeight * 0.85, -rightWingRidgeLength/2,  
      0, roofHeight * 0.85, rightWingRidgeLength/2    
    ]);
    
    rightWingRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(rightWingRidgePoints, 3));
    
    const rightWingRidgeLines = new THREE.LineSegments(rightWingRidgeLineGeometry, ridgeLineMaterial);
    rightWingRidgeLines.position.copy(rightWingRoof.position);
    rightWingRidgeLines.position.y += 0.02;
    houseGroup.add(rightWingRidgeLines);
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