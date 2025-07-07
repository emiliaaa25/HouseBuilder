import * as THREE from 'three';
import { MaterialService } from '../services/material.service';
import { HouseSpecifications, RoofType } from './houseSpecifications.model';
import { HouseFactoryService } from '../services/house-factory.service';
import { Floor } from './floor.model';
import { floor } from 'three/src/nodes/TSL.js';

export class TShapeHouseModel {
  constructor(
    private houseSpecs: HouseSpecifications,
    private materialService: MaterialService,
    private houseFactory: HouseFactoryService
  ) { }
  
  build(houseGroup: THREE.Group): void {
    const shapeParams = (this.houseSpecs as any).shapeParameters || {};
    const mainLength = shapeParams.MainLength || 12;
    const mainWidth = shapeParams.MainWidth || 8;
    const crossLength = shapeParams.CrossLength || 6;
    const crossWidth = shapeParams.CrossWidth || 6;
    const height = this.houseFactory.calculateTotalHeight(this.houseSpecs);    
    
    const floors = this.houseSpecs.floors|| [];
    const wallsGroup = new THREE.Group();
    
    this.createWalls(wallsGroup, mainWidth, mainLength, crossWidth, crossLength, height);
    
    this.createFloors(wallsGroup, mainWidth, mainLength, crossWidth, crossLength);
    
    houseGroup.add(wallsGroup);
    
    this.addRoof(houseGroup, mainWidth, mainLength, crossWidth, crossLength, height);
     if (floors && floors.length > 1) {
      this.addFloorBands(houseGroup, mainWidth, mainLength, crossWidth, crossLength, floors);
    }
  }
  
  private createWalls(wallsGroup: THREE.Group, mainWidth: number, mainLength: number, 
                     crossWidth: number, crossLength: number, height: number): void {
    
    const frontMainGeometry = new THREE.PlaneGeometry(mainWidth, height);
    const frontMainMaterial = this.getWallMaterial('MainFront');
    const frontMainWall = new THREE.Mesh(frontMainGeometry, frontMainMaterial);
    frontMainWall.position.set(0, height/2, -mainLength/2);
    wallsGroup.add(frontMainWall);
    
    const backGap = crossWidth;
    const sideWidth = (mainWidth - backGap) / 2;
    
    const backMainLeftGeometry = new THREE.PlaneGeometry(sideWidth, height);
    const backMainLeftMaterial = this.getWallMaterial('MainBackLeft');
    const backMainLeftWall = new THREE.Mesh(backMainLeftGeometry, backMainLeftMaterial);
    backMainLeftWall.position.set(-mainWidth/2 + sideWidth/2, height/2, mainLength/2);
    backMainLeftWall.rotation.y = Math.PI;
    wallsGroup.add(backMainLeftWall);
    
    const backMainRightGeometry = new THREE.PlaneGeometry(sideWidth, height);
    const backMainRightMaterial = this.getWallMaterial('MainBackRight');
    const backMainRightWall = new THREE.Mesh(backMainRightGeometry, backMainRightMaterial);
    backMainRightWall.position.set(mainWidth/2 - sideWidth/2, height/2, mainLength/2);
    backMainRightWall.rotation.y = Math.PI;
    wallsGroup.add(backMainRightWall);
    
    const leftMainGeometry = new THREE.PlaneGeometry(mainLength, height);
    const leftMainMaterial = this.getWallMaterial('MainLeft');
    const leftMainWall = new THREE.Mesh(leftMainGeometry, leftMainMaterial);
    leftMainWall.position.set(-mainWidth/2, height/2, 0);
    leftMainWall.rotation.y = Math.PI/2;
    wallsGroup.add(leftMainWall);
    
    const rightMainGeometry = new THREE.PlaneGeometry(mainLength, height);
    const rightMainMaterial = this.getWallMaterial('MainRight');
    const rightMainWall = new THREE.Mesh(rightMainGeometry, rightMainMaterial);
    rightMainWall.position.set(mainWidth/2, height/2, 0);
    rightMainWall.rotation.y = -Math.PI/2;
    wallsGroup.add(rightMainWall);
    
    const backExtGeometry = new THREE.PlaneGeometry(crossWidth, height);
    const backExtMaterial = this.getWallMaterial('CrossBack');
    const backExtWall = new THREE.Mesh(backExtGeometry, backExtMaterial);
    backExtWall.position.set(0, height/2, mainLength/2 + crossLength);
    backExtWall.rotation.y = Math.PI;
    wallsGroup.add(backExtWall);
    
    const leftExtGeometry = new THREE.PlaneGeometry(crossLength, height);
    const leftExtMaterial = this.getWallMaterial('CrossLeft');
    const leftExtWall = new THREE.Mesh(leftExtGeometry, leftExtMaterial);
    leftExtWall.position.set(-crossWidth/2, height/2, mainLength/2 + crossLength/2);
    leftExtWall.rotation.y = Math.PI/2;
    wallsGroup.add(leftExtWall);
    
    const rightExtGeometry = new THREE.PlaneGeometry(crossLength, height);
    const rightExtMaterial = this.getWallMaterial('CrossRight');
    const rightExtWall = new THREE.Mesh(rightExtGeometry, rightExtMaterial);
    rightExtWall.position.set(crossWidth/2, height/2, mainLength/2 + crossLength/2);
    rightExtWall.rotation.y = -Math.PI/2;
    wallsGroup.add(rightExtWall);
    
  }
  
  private createFloors(wallsGroup: THREE.Group, mainWidth: number, mainLength: number,
                      crossWidth: number, crossLength: number): void {
    const floorMaterial = this.getFloorMaterial();
    
    const floorMainGeometry = new THREE.PlaneGeometry(mainWidth, mainLength);
    const floorMain = new THREE.Mesh(floorMainGeometry, floorMaterial);
    floorMain.position.set(0, 0, 0);
    floorMain.rotation.x = -Math.PI/2;
    wallsGroup.add(floorMain);
    
    const floorExtGeometry = new THREE.PlaneGeometry(crossWidth, crossLength);
    const floorExt = new THREE.Mesh(floorExtGeometry, floorMaterial);
    floorExt.position.set(0, 0, mainLength/2 + crossLength/2);
    floorExt.rotation.x = -Math.PI/2;
    wallsGroup.add(floorExt);
  }

  private addFloorBands(
    houseGroup: THREE.Group,
    mainWidth: number,
    mainLength: number,
    crossWidth: number,
    crossLength: number,
    floors: Floor[]
  ): void {
    if (!floors || floors.length <= 1) return;
    
    const sortedFloors = [...floors].sort((a, b) => a.index - b.index);
    
    const bandMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 0.08
    });
    
    let currentHeight = 0;
    
    for (let i = 0; i < sortedFloors.length - 1; i++) {
      currentHeight += sortedFloors[i].floorHeigth;
      
      const bandThickness = 0.08;
      const bandHeight = 0.08;
      const offset = 0.02;
      
      const backGap = crossWidth;
      const sideWidth = (mainWidth - backGap) / 2;
      
      const frontMainBand = new THREE.BoxGeometry(mainWidth, bandHeight, bandThickness);
      const frontMainBandMesh = new THREE.Mesh(frontMainBand, bandMaterial);
      frontMainBandMesh.position.set(0, currentHeight, -mainLength/2 - offset);
      frontMainBandMesh.name = `FloorBand_${i+1}_FrontMain`;
      houseGroup.add(frontMainBandMesh);
      
      const backMainLeftBand = new THREE.BoxGeometry(sideWidth, bandHeight, bandThickness);
      const backMainLeftBandMesh = new THREE.Mesh(backMainLeftBand, bandMaterial);
      backMainLeftBandMesh.position.set(-mainWidth/2 + sideWidth/2, currentHeight, mainLength/2 + offset);
      backMainLeftBandMesh.name = `FloorBand_${i+1}_BackMainLeft`;
      houseGroup.add(backMainLeftBandMesh);
      
      const backMainRightBand = new THREE.BoxGeometry(sideWidth, bandHeight, bandThickness);
      const backMainRightBandMesh = new THREE.Mesh(backMainRightBand, bandMaterial);
      backMainRightBandMesh.position.set(mainWidth/2 - sideWidth/2, currentHeight, mainLength/2 + offset);
      backMainRightBandMesh.name = `FloorBand_${i+1}_BackMainRight`;
      houseGroup.add(backMainRightBandMesh);
      
      const leftMainBand = new THREE.BoxGeometry(bandThickness, bandHeight, mainLength);
      const leftMainBandMesh = new THREE.Mesh(leftMainBand, bandMaterial);
      leftMainBandMesh.position.set(-mainWidth/2 - offset, currentHeight, 0);
      leftMainBandMesh.name = `FloorBand_${i+1}_LeftMain`;
      houseGroup.add(leftMainBandMesh);
      
      const rightMainBand = new THREE.BoxGeometry(bandThickness, bandHeight, mainLength);
      const rightMainBandMesh = new THREE.Mesh(rightMainBand, bandMaterial);
      rightMainBandMesh.position.set(mainWidth/2 + offset, currentHeight, 0);
      rightMainBandMesh.name = `FloorBand_${i+1}_RightMain`;
      houseGroup.add(rightMainBandMesh);
      
      const backExtBand = new THREE.BoxGeometry(crossWidth, bandHeight, bandThickness);
      const backExtBandMesh = new THREE.Mesh(backExtBand, bandMaterial);
      backExtBandMesh.position.set(0, currentHeight, mainLength/2 + crossLength + offset);
      backExtBandMesh.name = `FloorBand_${i+1}_BackExt`;
      houseGroup.add(backExtBandMesh);
      
      const leftExtBand = new THREE.BoxGeometry(bandThickness, bandHeight, crossLength);
      const leftExtBandMesh = new THREE.Mesh(leftExtBand, bandMaterial);
      leftExtBandMesh.position.set(-crossWidth/2 - offset, currentHeight, mainLength/2 + crossLength/2);
      leftExtBandMesh.name = `FloorBand_${i+1}_LeftExt`;
      houseGroup.add(leftExtBandMesh);
      
      const rightExtBand = new THREE.BoxGeometry(bandThickness, bandHeight, crossLength);
      const rightExtBandMesh = new THREE.Mesh(rightExtBand, bandMaterial);
      rightExtBandMesh.position.set(crossWidth/2 + offset, currentHeight, mainLength/2 + crossLength/2);
      rightExtBandMesh.name = `FloorBand_${i+1}_RightExt`;
      houseGroup.add(rightExtBandMesh);
      
      const connLeftBand = new THREE.BoxGeometry(bandThickness, bandHeight, bandThickness);
      const connLeftBandMesh = new THREE.Mesh(connLeftBand, bandMaterial);
      connLeftBandMesh.position.set(-crossWidth/2 - offset, currentHeight, mainLength/2 + offset);
      connLeftBandMesh.name = `FloorBand_${i+1}_ConnLeft`;
      houseGroup.add(connLeftBandMesh);
      
      const connRightBand = new THREE.BoxGeometry(bandThickness, bandHeight, bandThickness);
      const connRightBandMesh = new THREE.Mesh(connRightBand, bandMaterial);
      connRightBandMesh.position.set(crossWidth/2 + offset, currentHeight, mainLength/2 + offset);
      connRightBandMesh.name = `FloorBand_${i+1}_ConnRight`;
      houseGroup.add(connRightBandMesh);
    }
  }
  
  private addRoof(houseGroup: THREE.Group, mainWidth: number, mainLength: number,
                 crossWidth: number, crossLength: number, wallHeight: number): void {
    const roofMaterial = this.getRoofMaterial();
    
    switch (this.houseSpecs.roofType) {
      case RoofType.Flat:
        this.addFlatRoof(houseGroup, mainWidth, mainLength, crossWidth, crossLength, wallHeight, roofMaterial);
        break;
      
      case RoofType.Gable:
        this.addGableRoof(houseGroup, mainWidth, mainLength, crossWidth, crossLength, wallHeight, roofMaterial);
        break;

      case RoofType.Hip:
        this.addHipRoof(houseGroup, mainWidth, mainLength, crossWidth, crossLength, wallHeight, roofMaterial);
        break;
    
      default:
        this.addFlatRoof(houseGroup, mainWidth, mainLength, crossWidth, crossLength, wallHeight, roofMaterial);
    }
  }
  
  private addFlatRoof(houseGroup: THREE.Group, mainWidth: number, mainLength: number,
                     crossWidth: number, crossLength: number, wallHeight: number, material: THREE.Material): void {
    const mainRoofGeometry = new THREE.BoxGeometry(mainWidth+0.2, 0.2, mainLength+0.2);
    const mainRoof = new THREE.Mesh(mainRoofGeometry, material);
    mainRoof.position.set(0, wallHeight + 0.1, 0);
    houseGroup.add(mainRoof);
    
    const extensionRoofGeometry = new THREE.BoxGeometry(crossWidth+0.2, 0.2, crossLength+0.2);
    const extensionRoof = new THREE.Mesh(extensionRoofGeometry, material);
    extensionRoof.position.set(
      0,
      wallHeight + 0.1,
      mainLength/2 + crossLength/2
    );
    houseGroup.add(extensionRoof);
  }

  private addGableRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  material: THREE.Material
): void {
  
  const roofMargin = 0.5;
  
  const mainRoofHeight = mainWidth / 3.5;
  const crossRoofHeight = crossWidth / 3.5;
  
  this.createMainSectionGableRoof(
    houseGroup,
    mainWidth,
    mainLength,
    crossWidth,
    crossLength,
    wallHeight,
    mainRoofHeight,
    roofMargin,
    material
  );
  
  this.createCrossSectionGableRoof(
    houseGroup,
    mainWidth,
    mainLength,
    crossWidth,
    crossLength,
    wallHeight,
    crossRoofHeight,
    roofMargin,
    material
  );
  
  this.createGableWalls(
    houseGroup,
    mainWidth,
    mainLength,
    crossWidth,
    crossLength,
    wallHeight,
    mainRoofHeight,
    crossRoofHeight
  );
}

private createMainSectionGableRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  roofHeight: number,
  roofMargin: number,
  material: THREE.Material
): void {
  const adjustedWidth = mainWidth + roofMargin * 2;
  const adjustedLength = mainLength + roofMargin * 2;
  
  const mainRoofGeometry = new THREE.BufferGeometry();
  
  const vertices = new Float32Array([
    -adjustedWidth/2, 0, -adjustedLength/2,
    -adjustedWidth/2, 0, adjustedLength/2,
    0, roofHeight, -adjustedLength/2,
    0, roofHeight, adjustedLength/2,
    
    adjustedWidth/2, 0, -adjustedLength/2,
    adjustedWidth/2, 0, adjustedLength/2,
    0, roofHeight, -adjustedLength/2,
    0, roofHeight, adjustedLength/2,
  ]);
  
  const indices = [
    0, 2, 1,
    1, 2, 3,
    
    4, 5, 6,
    5, 7, 6
  ];
  
  mainRoofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  mainRoofGeometry.setIndex(indices);
  const mainVertexCount = vertices.length / 3;
const mainUvs = [];

for (let i = 0; i < mainVertexCount; i += 3) {
  mainUvs.push(0, 0);
  mainUvs.push(1, 0);
  mainUvs.push(0.5, 1);
}

mainRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(mainUvs), 2));

  mainRoofGeometry.computeVertexNormals();
  
  const gableRoof = new THREE.Mesh(mainRoofGeometry, material);
  gableRoof.name = "MainGableRoof";
  
  gableRoof.position.set(0, wallHeight, 0);
  
  houseGroup.add(gableRoof);
  
  const edgesGeometry = new THREE.EdgesGeometry(mainRoofGeometry);
  
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edges.position.copy(gableRoof.position);
  edges.position.y += 0.01;
  houseGroup.add(edges);
  
  const ridgeLineGeometry = new THREE.BufferGeometry();
  
  const ridgePoints = new Float32Array([
    0, roofHeight, -adjustedLength/2,
    0, roofHeight, adjustedLength/2
  ]);
  
  ridgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(ridgePoints, 3));
  
  const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x222222,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  });
  
  const ridgeLine = new THREE.Line(ridgeLineGeometry, ridgeLineMaterial);
  ridgeLine.position.copy(gableRoof.position);
  ridgeLine.position.y += 0.02;
  houseGroup.add(ridgeLine);
}

private createCrossSectionGableRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  roofHeight: number,
  roofMargin: number,
  material: THREE.Material
): void {
  const adjustedWidth = crossWidth + roofMargin * 2;
  const adjustedLength = crossLength + roofMargin * 2;
  
  const crossPosZ = mainLength/2 + crossLength/2;
  
  const crossRoofGeometry = new THREE.BufferGeometry();
  
  const vertices = new Float32Array([
   
    -adjustedWidth/2, 0, 0,
    -adjustedWidth/2, 0, adjustedLength,
    0, roofHeight, 0,
    0, roofHeight, adjustedLength,
    
    adjustedWidth/2, 0, 0,
    adjustedWidth/2, 0, adjustedLength,
    0, roofHeight, 0,
    0, roofHeight, adjustedLength
  ]);
  
  const indices = [
    0, 2, 1,
    1, 2, 3,
    
    4, 5, 6,
    5, 7, 6
  ];
  
  crossRoofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  crossRoofGeometry.setIndex(indices);
  const crossVertexCount = vertices.length / 3;
const crossUvs = [];

for (let i = 0; i < crossVertexCount; i += 3) {
  crossUvs.push(0, 0);
  crossUvs.push(1, 0);
  crossUvs.push(0.5, 1);
}

crossRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(crossUvs), 2));

  
  crossRoofGeometry.computeVertexNormals();
  
  const crossRoof = new THREE.Mesh(crossRoofGeometry, material);
  crossRoof.name = "CrossGableRoof";
  
  crossRoof.position.set(0, wallHeight, crossLength/2);
  
  houseGroup.add(crossRoof);
  
  const edgesGeometry = new THREE.EdgesGeometry(crossRoofGeometry);
  
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edges.position.copy(crossRoof.position);
  edges.position.y += 0.01;
  houseGroup.add(edges);
  
  const ridgeLineGeometry = new THREE.BufferGeometry();
  
  const ridgePoints = new Float32Array([
    0, roofHeight, 0,
    0, roofHeight, adjustedLength
  ]);
  
  ridgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(ridgePoints, 3));
  
  const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x222222,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  });
  
  const ridgeLine = new THREE.Line(ridgeLineGeometry, ridgeLineMaterial);
  ridgeLine.position.copy(crossRoof.position);
  ridgeLine.position.y += 0.02;
  houseGroup.add(ridgeLine);
  
  const valleyLineGeometry = new THREE.BufferGeometry();
  
  const valleyPoints = new Float32Array([
    -adjustedWidth/2, 0, 0,
    0, roofHeight, 0,
    
    adjustedWidth/2, 0, 0,
    0, roofHeight, 0
  ]);
  
  valleyLineGeometry.setAttribute('position', new THREE.BufferAttribute(valleyPoints, 3));
  
  const valleyLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x333333,
    linewidth: 2.5,
    transparent: true,
    opacity: 0.95
  });
  
  const valleyLines = new THREE.LineSegments(valleyLineGeometry, valleyLineMaterial);
  valleyLines.position.copy(crossRoof.position);
  valleyLines.position.y += 0.03;
  houseGroup.add(valleyLines);
}

private createGableWalls(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  mainRoofHeight: number,
  crossRoofHeight: number
): void {
  const frontWallMaterial = this.getWallMaterial('TShapeFront');
  const backWallMaterial = this.getWallMaterial('TShapeExtBack');
  
  const frontGableGeometry = new THREE.BufferGeometry();
  const frontGableVertices = new Float32Array([
    -mainWidth/2, wallHeight, -mainLength/2,
    mainWidth/2, wallHeight, -mainLength/2,
    0, wallHeight + mainRoofHeight, -mainLength/2
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
  
  const backExtGableGeometry = new THREE.BufferGeometry();
  const backExtGableVertices = new Float32Array([
    -crossWidth/2, wallHeight, mainLength/2 + crossLength,
    crossWidth/2, wallHeight, mainLength/2 + crossLength,
    0, wallHeight + crossRoofHeight, mainLength/2 + crossLength
  ]);
  
  backExtGableGeometry.setAttribute('position', new THREE.BufferAttribute(backExtGableVertices, 3));
  backExtGableGeometry.setIndex([2, 1, 0]);
  
  backExtGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,
    1, 0,
    0.5, 1
  ]), 2));
  
  backExtGableGeometry.computeVertexNormals();
  
  const backExtGable = new THREE.Mesh(backExtGableGeometry, backWallMaterial);
  backExtGable.name = "BackExtensionGable";
  houseGroup.add(backExtGable);
  
  const backMainGableGeometry = new THREE.BufferGeometry();
  const backMainGableVertices = new Float32Array([
    -mainWidth/2, wallHeight, mainLength/2,
    mainWidth/2, wallHeight, mainLength/2,
    0, wallHeight + mainRoofHeight, mainLength/2
  ]);
  backMainGableGeometry.setAttribute('position', new THREE.BufferAttribute(backMainGableVertices, 3));
  backMainGableGeometry.setIndex([0, 1, 2]);
  
  backMainGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,
    1, 0,
    0.5, 1
  ]), 2));
  backMainGableGeometry.computeVertexNormals();
  const backMainGable = new THREE.Mesh(backMainGableGeometry, frontWallMaterial);
  backMainGable.name = "BackMainGable";

  houseGroup.add(backMainGable);
}

private addHipRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  material: THREE.Material
): void {
  
  const roofMargin = 0.5;
  
  const roofHeight = Math.min(mainWidth, mainLength, crossWidth, crossLength) / 4;
  
  this.createMainSectionHipRoof(
    houseGroup,
    mainWidth,
    mainLength,
    crossWidth,
    crossLength,
    wallHeight,
    roofHeight,
    roofMargin,
    material
  );
  
  this.createCrossSectionHipRoof(
    houseGroup,
    mainWidth,
    mainLength,
    crossWidth,
    crossLength,
    wallHeight,
    roofHeight,
    roofMargin,
    material
  );
}

private createMainSectionHipRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  roofHeight: number,
  roofMargin: number,
  material: THREE.Material
): void {
  const adjustedWidth = mainWidth + roofMargin * 2;
  const adjustedLength = mainLength + roofMargin * 2;
  
  const ridgeLength = adjustedLength * 0.6;
  
  const geometry = new THREE.BufferGeometry();
  
  const vertices = new Float32Array([
    -adjustedWidth/2, 0, -adjustedLength/2,
    adjustedWidth/2, 0, -adjustedLength/2,
    adjustedWidth/2, 0, adjustedLength/2,
    -adjustedWidth/2, 0, adjustedLength/2,
    
    0, roofHeight, -ridgeLength/2,
    0, roofHeight, ridgeLength/2,
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
  const mainHipUvs = [];

for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i];
  const z = vertices[i + 2];
  
  const u = (x + adjustedWidth/2) / adjustedWidth;
  const v = (z + adjustedLength/2) / adjustedLength;
  
  mainHipUvs.push(u, v);
}

geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(mainHipUvs), 2));

  geometry.computeVertexNormals();
  
  const hipRoof = new THREE.Mesh(geometry, material);
  
  hipRoof.position.set(0, wallHeight, 0);
  
  houseGroup.add(hipRoof);
  
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  
  edges.position.copy(hipRoof.position);
  edges.position.y += 0.01;
  houseGroup.add(edges);
  
  const ridgeLineGeometry = new THREE.BufferGeometry();
  
  const ridgePoints = new Float32Array([
    0, roofHeight, -ridgeLength/2,
    0, roofHeight, ridgeLength/2,
    
    -adjustedWidth/2, 0, -adjustedLength/2,
    0, roofHeight, -ridgeLength/2,
    
    adjustedWidth/2, 0, -adjustedLength/2,
    0, roofHeight, -ridgeLength/2,
    
    adjustedWidth/2, 0, adjustedLength/2,
    0, roofHeight, ridgeLength/2,
    
    -adjustedWidth/2, 0, adjustedLength/2,
    0, roofHeight, ridgeLength/2,
  ]);
  
  ridgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(ridgePoints, 3));
  
  const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x222222,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  });
  
  const ridgeLines = new THREE.LineSegments(ridgeLineGeometry, ridgeLineMaterial);
  ridgeLines.position.copy(hipRoof.position);
  ridgeLines.position.y += 0.02;
  houseGroup.add(ridgeLines);
}

private createCrossSectionHipRoof(
  houseGroup: THREE.Group,
  mainWidth: number,
  mainLength: number,
  crossWidth: number,
  crossLength: number,
  wallHeight: number,
  roofHeight: number,
  roofMargin: number,
  material: THREE.Material
): void {
  const adjustedWidth = crossWidth + roofMargin * 2;
  const adjustedLength = crossLength + roofMargin * 2;
  
  const ridgeLength = adjustedLength * 0.7;
  
  const geometry = new THREE.BufferGeometry();
  
  const vertices = new Float32Array([
     -adjustedWidth/2, 0, -adjustedLength/2,
    adjustedWidth/2, 0, -adjustedLength/2,
    adjustedWidth/2, 0, adjustedLength/2,
    -adjustedWidth/2, 0, adjustedLength/2,
    
    0, roofHeight, -adjustedLength/2,
    0, roofHeight, adjustedLength/2,
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
  const crossHipUvs = [];

for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i];
  const z = vertices[i + 2];
  
  const u = (x + adjustedWidth/2) / adjustedWidth;
  const v = (z + adjustedLength/2) / adjustedLength;
  
  crossHipUvs.push(u, v);
}

geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(crossHipUvs), 2));
  geometry.computeVertexNormals();
  
  const hipRoof = new THREE.Mesh(geometry, material);
  
  hipRoof.position.set(0, wallHeight, crossLength/2 + mainLength/2);
  
  houseGroup.add(hipRoof);
  
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  
  edges.position.copy(hipRoof.position);
  edges.position.y += 0.01;
  houseGroup.add(edges);
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