import * as THREE from 'three';
import { MaterialService } from '../services/material.service';
import { HouseSpecifications, RoofType } from './houseSpecifications.model';
import { HouseFactoryService } from '../services/house-factory.service';
import { Floor } from './floor.model';

export class LShapeHouseModel {
  constructor(
    private houseSpecs: HouseSpecifications,
    private materialService: MaterialService,
    private houseFactory: HouseFactoryService
  ) { }
  
  build(houseGroup: THREE.Group): void {
    const shapeParams = (this.houseSpecs as any).shapeParameters || {};
    const length1 = shapeParams.MainLength || 12;
    const width1 = shapeParams.MainWidth || 8;
    const length2 = shapeParams.ExtensionLength || 6;
    const width2 = shapeParams.ExtensionWidth || 6;
    const height = this.houseFactory.calculateTotalHeight(this.houseSpecs);  
    const floors = this.houseSpecs.floors || [];  
    const wallsGroup = new THREE.Group();
    this.createWalls(wallsGroup, width1, length1, width2, length2, height);
    this.createFloors(wallsGroup, width1, length1, width2, length2);
    houseGroup.add(wallsGroup);
    this.addRoof(houseGroup, width1, length1, width2, length2, height);
 if (floors && floors.length > 1) {
      this.addFloorBands(houseGroup, width1, length1, width2, length2, floors);
    }
  }
  
  private createWalls(
    wallsGroup: THREE.Group,
    mainWidth: number,
    mainLength: number,
    extensionWidth: number,
    extensionLength: number,
    height: number
  ): void {
    const width1 = mainWidth;
    const length1 = mainLength;
    const width2 = extensionWidth;
    const length2 = extensionLength;
    const leftWall = new THREE.BoxGeometry(0.2, height, length1);
    const leftWallMaterial = this.getWallMaterial('MainRight');
    const leftWallMesh = new THREE.Mesh(leftWall, leftWallMaterial);
    leftWallMesh.position.set(width1, height/2, width2-length1/2);
    wallsGroup.add(leftWallMesh);

    const rightWall = new THREE.BoxGeometry(0.2, height, length2);
    const rightWallMaterial = this.getWallMaterial('ExtensionBack');
    const rightWallMesh = new THREE.Mesh(rightWall, rightWallMaterial);

    rightWallMesh.position.set(width1-length2/2, height/2, width2);
    rightWallMesh.rotation.y = Math.PI/2; 
    wallsGroup.add(rightWallMesh);

    const backWall = new THREE.BoxGeometry(width1, height, 0.2);
    const backWallMaterial = this.getWallMaterial('MainBack');
    const backWallMesh = new THREE.Mesh(backWall, backWallMaterial);
    backWallMesh.position.set(width1/2, height/2, width2-length1);
    wallsGroup.add(backWallMesh);

    const frontWall = new THREE.BoxGeometry(width2, height, 0.2);
    const frontExtensionMaterial = this.getWallMaterial('ExtensionLeft');
    const frontWallMesh = new THREE.Mesh(frontWall, frontExtensionMaterial);
    frontWallMesh.position.set(width1-length2, height/2, width2/2);
    frontWallMesh.rotation.y = Math.PI/2; // Rotate to align with the extension
    wallsGroup.add(frontWallMesh);

    const frontWall2 = new THREE.BoxGeometry(length2-width1, height, 0.2);
    const frontWallMaterial2 = this.getWallMaterial('ExtensionFront');
    const frontWallMesh2 = new THREE.Mesh(frontWall2, frontWallMaterial2);
    frontWallMesh2.position.set((width1-length2)/2, height/2, 0);
    wallsGroup.add(frontWallMesh2);

    const leftWallExt = new THREE.BoxGeometry(0.2, height, length1-width2);
    const leftWallExtMaterial = this.getWallMaterial('MainLeft');
    const leftWallExtMesh = new THREE.Mesh(leftWallExt, leftWallExtMaterial);
    leftWallExtMesh.position.set(0, height/2, (width2-length1)/2);
    wallsGroup.add(leftWallExtMesh);    
  }

  private createFloors(
    wallsGroup: THREE.Group, 
    mainWidth: number, 
    mainLength: number,
    extensionWidth: number, 
    extensionLength: number
  ): void {
    const floorMaterial = this.getFloorMaterial();

    const width1 = mainWidth;
    const length1 = mainLength;
    const width2 = extensionWidth;
    const length2 = extensionLength;
    const mainFloorGeometry = new THREE.PlaneGeometry(mainWidth, length1-width2);
    const mainFloor = new THREE.Mesh(mainFloorGeometry, floorMaterial);
    mainFloor.rotation.x = -Math.PI/2; 
    mainFloor.position.set(mainWidth/2, 0.1, (width2-length1)/2);
    wallsGroup.add(mainFloor);

    const extensionFloorGeometry = new THREE.PlaneGeometry(extensionLength, extensionWidth);
    const extensionFloor = new THREE.Mesh(extensionFloorGeometry, floorMaterial);
    extensionFloor.rotation.x = -Math.PI/2; 
    extensionFloor.position.set((mainWidth-extensionLength/2), 0.1, extensionWidth/2);
    wallsGroup.add(extensionFloor);
  }
 
   private addFloorBands(
    houseGroup: THREE.Group,
    mainWidth: number,
    mainLength: number,
    extensionWidth: number,
    extensionLength: number,
    floors: Floor[]
  ): void {
    const width1 = mainWidth;
    const length1 = mainLength;
    const width2 = extensionWidth;
    const length2 = extensionLength;
    
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
      const leftWallBand = new THREE.BoxGeometry(bandThickness, bandHeight, length1);
      const leftWallBandMesh = new THREE.Mesh(leftWallBand, bandMaterial);
      leftWallBandMesh.position.set(width1 + offset, currentHeight, width2-length1/2);
      leftWallBandMesh.name = `FloorBand_${i+1}_LeftWall`;
      houseGroup.add(leftWallBandMesh);
      const rightWallBand = new THREE.BoxGeometry(length2, bandHeight, bandThickness);
      const rightWallBandMesh = new THREE.Mesh(rightWallBand, bandMaterial);
      rightWallBandMesh.position.set(width1-length2/2, currentHeight, width2 + offset);
      rightWallBandMesh.name = `FloorBand_${i+1}_RightWall`;
      houseGroup.add(rightWallBandMesh);
      const backWallBand = new THREE.BoxGeometry(width1, bandHeight, bandThickness);
      const backWallBandMesh = new THREE.Mesh(backWallBand, bandMaterial);
      backWallBandMesh.position.set(width1/2, currentHeight, width2-length1 - offset);
      backWallBandMesh.name = `FloorBand_${i+1}_BackWall`;
      houseGroup.add(backWallBandMesh);
      
      const frontWallBand = new THREE.BoxGeometry(bandThickness, bandHeight, width2);
      const frontWallBandMesh = new THREE.Mesh(frontWallBand, bandMaterial);
      frontWallBandMesh.position.set(width1-length2 - offset, currentHeight, width2/2);
      frontWallBandMesh.name = `FloorBand_${i+1}_FrontWall`;
      houseGroup.add(frontWallBandMesh);
      
      const frontWall2Band = new THREE.BoxGeometry(length2-width1, bandHeight, bandThickness);
      const frontWall2BandMesh = new THREE.Mesh(frontWall2Band, bandMaterial);
      frontWall2BandMesh.position.set((width1-length2)/2, currentHeight, 0 + offset*2);
      frontWall2BandMesh.name = `FloorBand_${i+1}_FrontWall2`;
      houseGroup.add(frontWall2BandMesh);
      const leftWallExtBand = new THREE.BoxGeometry(bandThickness, bandHeight, length1-width2);
      const leftWallExtBandMesh = new THREE.Mesh(leftWallExtBand, bandMaterial);
      leftWallExtBandMesh.position.set(0 - offset, currentHeight, (width2-length1)/2);
      leftWallExtBandMesh.name = `FloorBand_${i+1}_LeftWallExt`;
      houseGroup.add(leftWallExtBandMesh);
      
      const rightEdgeBand = new THREE.BoxGeometry(bandThickness, bandHeight, width2-length1+length1);
      const rightEdgeBandMesh = new THREE.Mesh(rightEdgeBand, bandMaterial);
      rightEdgeBandMesh.position.set(width1 , currentHeight, (width2-length1)/2);
      rightEdgeBandMesh.name = `FloorBand_${i+1}_RightEdge`;
      houseGroup.add(rightEdgeBandMesh);
    }
  }

  private addRoof(
    houseGroup: THREE.Group, 
    mainWidth: number, 
    mainLength: number,
    extensionWidth: number, 
    extensionLength: number, 
    wallHeight: number
  ): void {
    const roofMaterial = this.getRoofMaterial();
    
    switch (this.houseSpecs.roofType) {
      case RoofType.Flat:
        this.addFlatRoof(houseGroup, mainWidth, mainLength, extensionWidth, extensionLength, wallHeight, roofMaterial);
        break;
      case RoofType.Cross_gabled:
        this.addGableRoof(houseGroup, mainWidth, mainLength, extensionWidth, extensionLength, wallHeight, roofMaterial);
        break;    
       case RoofType.Hip:
      this.addHipRoof(houseGroup, mainWidth, mainLength, extensionWidth, extensionLength, wallHeight, roofMaterial);
      break;
      default:
        this.addFlatRoof(houseGroup, mainWidth, mainLength, extensionWidth, extensionLength, wallHeight, roofMaterial);
    }
  }
  
  private addFlatRoof(
    houseGroup: THREE.Group, 
    mainWidth: number, 
    mainLength: number,
    extensionWidth: number, 
    extensionLength: number, 
    wallHeight: number, 
    material: THREE.Material
  ): void {
    const width1 = mainWidth;
    const length1 = mainLength;
    const width2 = extensionWidth;
    const length2 = extensionLength;
    
    const mainRoofGeometry = new THREE.BoxGeometry(mainWidth+0.4, 0.2, length1-width2+0.4);
    const mainRoof = new THREE.Mesh(mainRoofGeometry, material);
    mainRoof.position.set(mainWidth/2, wallHeight + 0.1, (width2-length1)/2);
    houseGroup.add(mainRoof);
    const extensionRoofGeometry = new THREE.BoxGeometry(extensionLength+0.4, 0.2, extensionWidth+0.4);
    const extensionRoof = new THREE.Mesh(extensionRoofGeometry, material);
    extensionRoof.position.set((mainWidth-extensionLength/2), wallHeight + 0.1, extensionWidth/2);
    houseGroup.add(extensionRoof);
  }



private addGableRoof(
  houseGroup: THREE.Group, 
  mainWidth: number, 
  mainLength: number,
  extensionWidth: number, 
  extensionLength: number, 
  wallHeight: number, 
  material: THREE.Material
): void {
  const width1 = mainWidth;      
  const length1 = mainLength;      
  const width2 = extensionWidth;   
  const length2 = extensionLength;  
  const roofMargin = 0.5;
  const mainRoofHeight = width1 / 3.5;  
  const extRoofHeight = width2 / 3.5; 

  const adjustedWidth1 = width1 + roofMargin * 2;
  const adjustedLength1 = (length1 - width2) + roofMargin * 2;
  
  const mainCenterX = width1/2;
  const mainCenterZ = (width2-length1)/2;
  const mainRoofGeometry = new THREE.BufferGeometry();
  
  const mainVertices = new Float32Array([
    -width1/2, 0, -(length1-width2)/2,     // 0: stânga față
    width1/2, 0, -(length1-width2)/2,      // 1: dreapta față
    width1/2, 0, (length1-width2)/2,       // 2: dreapta spate
    -width1/2, 0, (length1-width2)/2,      // 3: stânga spate
    
    -(width1/2 + roofMargin), 0, -(length1-width2)/2 - roofMargin,  // 4: stânga față + streașină
    (width1/2 + roofMargin), 0, -(length1-width2)/2 - roofMargin,   // 5: dreapta față + streașină
    (width1/2 + roofMargin), 0, (length1-width2)/2 + roofMargin,    // 6: dreapta spate + streașină
    -(width1/2 + roofMargin), 0, (length1-width2)/2 + roofMargin,   // 7: stânga spate + streașină
    
    0, mainRoofHeight, -(length1-width2)/2,            // 8: vârf culme față
    0, mainRoofHeight, (length1-width2)/2,             // 9: vârf culme spate
    0, mainRoofHeight, -(length1-width2)/2 - roofMargin, // 10: vârf culme față + streașină
    0, mainRoofHeight, (length1-width2)/2 + roofMargin,  // 11: vârf culme spate + streașină
  ]);
  
  const mainIndices = [
    // Panta stângă - partea principală
    0, 8, 3,
    3, 8, 9,
    
    // Panta dreaptă - partea principală
    1, 2, 8,
    2, 9, 8,
    
    // Streașina frontală - stânga
    0, 4, 8,
    4, 10, 8,
    
    // Streașina frontală - dreapta
    1, 8, 5,
    5, 8, 10,
    
    // Streașina din spate - stânga
    3, 9, 7,
    7, 9, 11,
    
    // Streașina din spate - dreapta
    2, 6, 9,
    6, 11, 9,
    
    // Streașina laterală - stânga
    0, 3, 4,
    3, 7, 4,
    
    // Streașina laterală - dreapta
    1, 5, 2,
    2, 5, 6
  ];
  
  mainRoofGeometry.setAttribute('position', new THREE.BufferAttribute(mainVertices, 3));
  mainRoofGeometry.setIndex(mainIndices);
  const mainVertexCount = mainVertices.length / 3;
const mainUvs = [];

for (let i = 0; i < mainVertexCount; i += 3) {
  mainUvs.push(0, 0);    // primul vârf
  mainUvs.push(1, 0);    // al doilea vârf  
  mainUvs.push(0.5, 1);  // al treilea vârf
}

mainRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(mainUvs), 2));

  mainRoofGeometry.computeVertexNormals();
  
  const mainRoof = new THREE.Mesh(mainRoofGeometry, material);
  mainRoof.name = "MainGableRoof";
  mainRoof.position.set(mainCenterX, wallHeight, mainCenterZ);
  houseGroup.add(mainRoof);
  
  const frontWallMaterial = this.getWallMaterial('MainFront');
  const backWallMaterial = this.getWallMaterial('MainBack');
  const sideWallMaterial = this.getWallMaterial('walls');
  
  const mainFrontGableGeometry = new THREE.BufferGeometry();
  const mainFrontGableVertices = new Float32Array([
    -width1/2, 0, -(length1-width2)/2,    // stânga jos
    width1/2, 0, -(length1-width2)/2,     // dreapta jos
    0, mainRoofHeight, -(length1-width2)/2 // vârf
  ]);
  
  mainFrontGableGeometry.setAttribute('position', new THREE.BufferAttribute(mainFrontGableVertices, 3));
  mainFrontGableGeometry.setIndex([0, 1, 2]);
  
  mainFrontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,   // stânga jos
    1, 0,   // dreapta jos
    0.5, 1  // centru sus
  ]), 2));
  
  mainFrontGableGeometry.computeVertexNormals();
  const mainFrontGable = new THREE.Mesh(mainFrontGableGeometry, frontWallMaterial);
  mainFrontGable.name = "MainFrontGable";
  mainFrontGable.position.set(mainCenterX, wallHeight, mainCenterZ);
  houseGroup.add(mainFrontGable);
  
  const mainBackGableGeometry = new THREE.BufferGeometry();
  const mainBackGableVertices = new Float32Array([
    -width1/2, 0, (length1-width2)/2,    // stânga jos
    width1/2, 0, (length1-width2)/2,     // dreapta jos
    0, mainRoofHeight, (length1-width2)/2 // vârf
  ]);
  
  mainBackGableGeometry.setAttribute('position', new THREE.BufferAttribute(mainBackGableVertices, 3));
  mainBackGableGeometry.setIndex([2, 1, 0]); 
  mainBackGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,   // stânga jos
    1, 0,   // dreapta jos
    0.5, 1  // centru sus
  ]), 2));
  
  mainBackGableGeometry.computeVertexNormals();
  const mainBackGable = new THREE.Mesh(mainBackGableGeometry, backWallMaterial);
  mainBackGable.name = "MainBackGable";
  mainBackGable.position.set(mainCenterX, wallHeight, mainCenterZ);
  houseGroup.add(mainBackGable);
  const extCenterX = width1 - length2/2;
  const extCenterZ = width2/2;
  const extRoofGeometry = new THREE.BufferGeometry();
  
  const extVertices = new Float32Array([
    -length2/2, 0, -width2/2,      // 0: stânga față
    length2/2, 0, -width2/2,       // 1: dreapta față
    length2/2, 0, width2/2,        // 2: dreapta spate
    -length2/2, 0, width2/2,       // 3: stânga spate
    -(length2/2 + roofMargin), 0, -width2/2 - roofMargin,  // 4: stânga față + streașină
    (length2/2 + roofMargin), 0, -width2/2 - roofMargin,   // 5: dreapta față + streașină
    (length2/2), 0, width2/2 + roofMargin,              // 6: dreapta spate + streașină (fără ext la dreapta)
    -(length2/2 + roofMargin), 0, width2/2 + roofMargin,   // 7: stânga spate + streașină
    0, extRoofHeight, -width2/2,             // 8: vârf culme față
    0, extRoofHeight, width2/2,              // 9: vârf culme spate
    0, extRoofHeight, -width2/2 - roofMargin,  // 10: vârf culme față + streașină
    0, extRoofHeight, width2/2 + roofMargin,   // 11: vârf culme spate + streașină
  ]);
  const extIndices = [
    // Panta stângă - partea extensiei
    0, 8, 3,
    3, 8, 9,
    
    // Panta dreaptă - partea extensiei
    1, 2, 8,
    2, 9, 8,
    
    // Streașina frontală - stânga
    0, 4, 8,
    4, 10, 8,
    
    // Streașina frontală - dreapta
    1, 8, 5,
    5, 8, 10,
    
    // Streașina din spate - stânga
    3, 9, 7,
    7, 9, 11,
    
    // Streașina din spate - dreapta
    2, 6, 9,
    6, 11, 9,
    
    // Streașina laterală - stânga
    0, 3, 4,
    3, 7, 4
    
  ];
  extRoofGeometry.setAttribute('position', new THREE.BufferAttribute(extVertices, 3));
  extRoofGeometry.setIndex(extIndices);
  const extVertexCount = extVertices.length / 3;
const extUvs = [];

for (let i = 0; i < extVertexCount; i += 3) {
  extUvs.push(0, 0);    // primul vârf
  extUvs.push(1, 0);    // al doilea vârf  
  extUvs.push(0.5, 1);  // al treilea vârf
}

extRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(extUvs), 2));

  extRoofGeometry.computeVertexNormals();
  const extRoof = new THREE.Mesh(extRoofGeometry, material);
  extRoof.name = "ExtensionGableRoof";
  extRoof.position.set(extCenterX, wallHeight, extCenterZ);
  houseGroup.add(extRoof);
  const extFrontGableGeometry = new THREE.BufferGeometry();
  const extFrontGableVertices = new Float32Array([
    -width2/1.5, 0, 0,            // stânga jos
    width2/1.5, 0, 0,             // dreapta jos
    0, extRoofHeight, 0         // vârf
  ]);
  
  extFrontGableGeometry.setAttribute('position', new THREE.BufferAttribute(extFrontGableVertices, 3));
  extFrontGableGeometry.setIndex([0, 1, 2]);
  extFrontGableGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,   // stânga jos
    1, 0,   // dreapta jos
    0.5, 1  // centru sus
  ]), 2));
  
  extFrontGableGeometry.computeVertexNormals();
  const extFrontGable = new THREE.Mesh(extFrontGableGeometry, sideWallMaterial);
  extFrontGable.name = "ExtensionFrontGable";
  extFrontGable.position.set(width2+0.75, wallHeight, width2);
  houseGroup.add(extFrontGable);
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  const mainEdgesGeometry = new THREE.EdgesGeometry(mainRoofGeometry);
  const mainEdges = new THREE.LineSegments(mainEdgesGeometry, edgesMaterial);
  mainEdges.position.copy(mainRoof.position);
  mainEdges.position.y += 0.01; 
  houseGroup.add(mainEdges);
  
  const extEdgesGeometry = new THREE.EdgesGeometry(extRoofGeometry);
  const extEdges = new THREE.LineSegments(extEdgesGeometry, edgesMaterial);
  extEdges.position.copy(extRoof.position);
  extEdges.rotation.copy(extRoof.rotation);
  extEdges.position.y += 0.01;
  houseGroup.add(extEdges);
  
  const ridgeLineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x222222,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  });
  
  const mainRidgeLineGeometry = new THREE.BufferGeometry();
  const mainRidgePoints = new Float32Array([
    0, mainRoofHeight, -(length1-width2)/2 - roofMargin,  // culme față + streașină
    0, mainRoofHeight, -(length1-width2)/2,               // culme față
    0, mainRoofHeight, (length1-width2)/2,                // culme spate
    0, mainRoofHeight, (length1-width2)/2 + roofMargin    // culme spate + streașină
  ]);
  
  mainRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(mainRidgePoints, 3));
  
  const mainRidgeLines = new THREE.LineSegments(mainRidgeLineGeometry, ridgeLineMaterial);
  mainRidgeLines.position.copy(mainRoof.position);
  mainRidgeLines.position.y += 0.02; 
  houseGroup.add(mainRidgeLines);
  
  const extRidgeLineGeometry = new THREE.BufferGeometry();
  const extRidgePoints = new Float32Array([
    0, extRoofHeight, -width2/2 - roofMargin,  // culme față + streașină
    0, extRoofHeight, -width2/2,               // culme față
    0, extRoofHeight, width2/2,                // culme spate
    0, extRoofHeight, width2/2 + roofMargin    // culme spate + streașină
  ]);
  
  extRidgeLineGeometry.setAttribute('position', new THREE.BufferAttribute(extRidgePoints, 3));
  
  const extRidgeLines = new THREE.LineSegments(extRidgeLineGeometry, ridgeLineMaterial);
  extRidgeLines.position.copy(extRoof.position);
  extRidgeLines.rotation.copy(extRoof.rotation);
  extRidgeLines.position.y += 0.02;
  houseGroup.add(extRidgeLines);
}



  
private addHipRoof(
  houseGroup: THREE.Group, 
  mainWidth: number, 
  mainLength: number,
  extensionWidth: number, 
  extensionLength: number, 
  wallHeight: number, 
  material: THREE.Material
): void {
  const width1 = mainWidth;         // Lățimea secțiunii principale
  const length1 = mainLength;       // Lungimea secțiunii principale
  const width2 = extensionWidth;    // Lățimea extensiei
  const length2 = extensionLength;  // Lungimea extensiei
  const roofMargin = 0.5;
  const roofHeight = Math.min(width1, length1, width2, length2) / 4;
  const mainRoofGeometry = new THREE.BufferGeometry();
  mainWidth = width1 + roofMargin * 2;
  mainLength = (length1 - width2) + roofMargin * 2;
  const mainCenterX = width1/2;
  const mainCenterZ = (width2-length1)/2;
  const mainRidgeLength = mainLength * 0.6;
  const mainVertices = new Float32Array([
    -mainWidth/2, 0, -mainLength/2,  // 0: stânga față
    mainWidth/2, 0, -mainLength/2,   // 1: dreapta față
    mainWidth/2, 0, mainLength/2,    // 2: dreapta spate
    -mainWidth/2, 0, mainLength/2,   // 3: stânga spate
    0, roofHeight, -mainRidgeLength/2,  // 4: punctul frontal al culmii
    0, roofHeight, mainRidgeLength/2,   // 5: punctul din spate al culmii
  ]);
  
  const mainIndices = [
    0, 1, 4,
    
    // Partea dreaptă (două triunghiuri)
    1, 2, 5,
    1, 5, 4,
    
    // Triunghiul din spate
    2, 3, 5,
    
    // Partea stângă (două triunghiuri)
    3, 0, 4,
    3, 4, 5
  ];
  
  mainRoofGeometry.setAttribute('position', new THREE.BufferAttribute(mainVertices, 3));
  mainRoofGeometry.setIndex(mainIndices);
  const mainHipUvs = [];

for (let i = 0; i < mainVertices.length; i += 3) {
  const x = mainVertices[i];
  const z = mainVertices[i + 2];
  const u = (x + mainWidth/2) / mainWidth;
  const v = (z + mainLength/2) / mainLength;
  
  mainHipUvs.push(u, v);
}

mainRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(mainHipUvs), 2));

  mainRoofGeometry.computeVertexNormals();
  const mainRoof = new THREE.Mesh(mainRoofGeometry, material);
  mainRoof.position.set(mainCenterX, wallHeight, mainCenterZ);
  houseGroup.add(mainRoof);
  const extRoofGeometry = new THREE.BufferGeometry();
  
  const extWidth = length2 + roofMargin * 2; 
  const extLength = width2 + roofMargin * 2; 
  const extCenterX = width1 - length2/2;
  const extCenterZ = width2/2;
  const extRidgeLength = extLength * 0.6;
  const extVertices = new Float32Array([
    -extWidth/2, 0, -extLength/2.5,  // 0: stânga față
    extWidth/2, 0, -extLength/2.6,   // 1: dreapta față
    extWidth/2, 0, extLength/2,    // 2: dreapta spate
    -extWidth/2, 0, extLength/2,   // 3: stânga spate
    0, roofHeight * 0.85, -extRidgeLength/1.8,  // 4: punctul frontal al culmii (înălțime ușor redusă)
    0, roofHeight * 0.85, extRidgeLength/2,   // 5: punctul din spate al culmii
  ]);
  
  const extIndices = [
    // Triunghiul frontal
    0, 1, 4,
    
    // Partea dreaptă (două triunghiuri)
    1, 2, 5,
    1, 5, 4,
    
    // Triunghiul din spate
    2, 3, 5,
    
    // Partea stângă (două triunghiuri)
    3, 0, 4,
    3, 4, 5
  ];
  extRoofGeometry.setAttribute('position', new THREE.BufferAttribute(extVertices, 3));
  extRoofGeometry.setIndex(extIndices);
  const extHipUvs = [];
for (let i = 0; i < extVertices.length; i += 3) {
  const x = extVertices[i];
  const z = extVertices[i + 2];
  
  const u = (x + extWidth/2) / extWidth;
  const v = (z + extLength/2) / extLength;
  
  extHipUvs.push(u, v);
}

extRoofGeometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(extHipUvs), 2));
  extRoofGeometry.computeVertexNormals();
  const extRoof = new THREE.Mesh(extRoofGeometry, material);
  extRoof.position.set(extCenterX, wallHeight, extCenterZ);
  houseGroup.add(extRoof);
  const mainEdgesGeometry = new THREE.EdgesGeometry(mainRoofGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    linewidth: 1.5,
    transparent: true,
    opacity: 0.7
  });
  
  const mainEdges = new THREE.LineSegments(mainEdgesGeometry, edgesMaterial);
  mainEdges.position.copy(mainRoof.position);
  mainEdges.position.y += 0.01; 
  houseGroup.add(mainEdges);
  const extSelectedEdgesGeometry = new THREE.BufferGeometry();
  const selectedEdgeVertices = new Float32Array([
    // Linia frontală exterioară
    -extWidth/2, 0, -extLength/1.7,
    extWidth/2, 0, -extLength/1.7,
    
    // Linia din dreapta (după rotație)
    extWidth/2, 0, -extLength/1.7,
    extWidth/2, 0, extLength/2,
    
    // Linia din spate
    extWidth/2, 0, extLength/2,
    -extWidth/2, 0, extLength/2,
    
    // Linia din stânga exterioară (după rotație)
    -extWidth/2, 0, extLength/2,
    -extWidth/2, 0, -extLength/1.7,
    
   
    extWidth/2, 0, extLength/2,
    0, roofHeight * 0.85, extRidgeLength/2,
    
    -extWidth/2, 0, extLength/2,
    0, roofHeight * 0.85, extRidgeLength/2,
    
    // Linia culmii
    0, roofHeight * 0.85, -extRidgeLength/1.8,
    0, roofHeight * 0.85, extRidgeLength/2
  ]);
  
  extSelectedEdgesGeometry.setAttribute('position', new THREE.BufferAttribute(selectedEdgeVertices, 3));
  
  const extSelectedEdges = new THREE.LineSegments(extSelectedEdgesGeometry, edgesMaterial);
  extSelectedEdges.position.copy(extRoof.position);
  extSelectedEdges.rotation.copy(extRoof.rotation);
  extSelectedEdges.position.y += 0.01;
  houseGroup.add(extSelectedEdges);
  
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
    const material = this.materialService.createMaterial(this.houseSpecs.roofMaterial);
    material.side = THREE.DoubleSide;
    
    return material;
  }

  private getFloorMaterial(): THREE.MeshStandardMaterial {
    if (!this.houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    }
    
    return this.materialService.createMaterial(this.houseSpecs.floorMaterial);
  }
}