import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DEFAULT_SCALES, PlacedElement } from '../models/element.model';
import { v4 as uuidv4 } from 'uuid'; 
import { HouseShapeType, HouseSpecifications } from '../models/houseSpecifications.model';
import { Scale } from '../models/extras.model';

@Injectable({
  providedIn: 'root'
})
export class DragDrop3dService {
  private scene: THREE.Scene | null = null;
  private placedElements: Map<string, PlacedElement> = new Map();
  private gltfLoader = new GLTFLoader();
  private loadedModels: Map<string, THREE.Group> = new Map();
  private elementsGroup: THREE.Group;
  private houseSpecs: HouseSpecifications | undefined;
  private width: number = 0;
  private depth: number = 0;
  
  private defaultScales = DEFAULT_SCALES;
  
  constructor() {
    this.elementsGroup = new THREE.Group();
    this.elementsGroup.name = 'placedElements';
  }
  
  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.elementsGroup);
  }
  
  async addElement(element: Partial<PlacedElement> & Omit<PlacedElement, 'id'>): Promise<string> {
    if (!this.scene) {
      console.error('Scene not initialized');
      return Promise.reject('Scene not initialized');
    }
    const id = element.id || uuidv4();
    const defaultScale = this.defaultScales[element.type] || { x: 1.0, y: 1.0, z: 1.0 };
    
    const placedElement: PlacedElement = {
      ...element,
      id,
      scale: element.scale || defaultScale
    };
    
    placedElement.position = Math.max(0, Math.min(1, placedElement.position));
    if (placedElement.type === 'window' && placedElement.position2 !== undefined) {
      placedElement.position2 = Math.max(0, Math.min(15, placedElement.position2));
    }
    
    this.placedElements.set(id, placedElement);
    
    try {
      await this.loadAndPositionModel(placedElement);
      return id;
    } catch (error) {
      console.error('Error adding element:', error);
      this.placedElements.delete(id);
      return Promise.reject(error);
    }
  }
  
 updateElementPosition(id: string, wall: string, position: number, position2?: number): void {
  const element = this.placedElements.get(id);
  if (!element) {
    console.error(`Element with id ${id} not found`);
    return;
  }
  if (!this.houseSpecs) {
    console.error('Cannot update position: House specifications not available');
    return;
  }
  
  position = Math.max(0, Math.min(1, position));
  
  element.wall = wall;
  element.position = position;
  if (element.type === 'window' && position2 !== undefined) {
    element.position2 = Math.max(0, Math.min(15, position2));
  }
  
  const modelObject = this.elementsGroup.getObjectByName(id);
  if (!modelObject) {
    console.error(`Model object with id ${id} not found in scene`);
    return;
  }
  const position3D = this.calculatePosition(element, this.houseSpecs);
  
  modelObject.position.copy(position3D);
  const rotation = this.calculateRotation(element.wall);
  modelObject.rotation.set(rotation.x, rotation.y, rotation.z);
}
  

  updateElementScale(id: string, scale: Scale): void {
    const element = this.placedElements.get(id);
    if (!element) {
      console.error(`Element with id ${id} not found`);
      return;
    }
    
    const modelObject = this.elementsGroup.getObjectByName(id);
    if (!modelObject) {
      console.error(`Model object with id ${id} not found in scene`);
      return;
    }
    const originalPosition = modelObject.position.clone();
    element.scale = scale;
    modelObject.scale.set(scale.x, scale.y, scale.z);
    modelObject.position.copy(originalPosition);
  }

  resetElementScale(id: string): void {
    const element = this.placedElements.get(id);
    if (!element) {
      console.error(`Element with id ${id} not found`);
      return;
    }
    
    const defaultScale = this.defaultScales[element.type] || { x: 1.0, y: 1.0, z: 1.0 };
    this.updateElementScale(id, defaultScale);
  }
  
  removeElement(id: string): void {
    const modelObject = this.elementsGroup.getObjectByName(id);
    if (modelObject) {
      this.elementsGroup.remove(modelObject);
    }
    this.placedElements.delete(id);
  }
  
  clearAll(): void {
    while (this.elementsGroup.children.length > 0) {
      this.elementsGroup.remove(this.elementsGroup.children[0]);
    }
    this.placedElements.clear();
  }
  
  getPlacedElements(): PlacedElement[] {
    return Array.from(this.placedElements.values());
  }
  
  selectElementWithRaycast(
    mouseX: number,
    mouseY: number,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ): PlacedElement | null {
    if (!this.scene) return null;
    
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    const intersects = raycaster.intersectObjects(this.elementsGroup.children, true);
    
    if (intersects.length > 0) {
      let currentObj: THREE.Object3D | null = intersects[0].object;
      while (currentObj && !this.placedElements.has(currentObj.name)) {
        currentObj = currentObj.parent;
      }
      
      if (currentObj && currentObj.name) {
        return this.placedElements.get(currentObj.name) || null;
      }
    }
    
    return null;
  }
  
  selectWallWithRaycast(
    mouseX: number,
    mouseY: number,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer
  ): { wall: string, position: number } | null {
    if (!this.scene || !this.houseSpecs) return null;
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const walls: THREE.Mesh[] = [];
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const name = object.name.toLowerCase();
        
        if (name.includes('wall') || 
            name.includes('front') || 
            name.includes('back') || 
            name.includes('left') || 
            name.includes('right') ||
            name === '' || 
            object.parent?.name.includes('Wall') 
           ) {
          walls.push(object);
        }
      }
    });
    
    if (walls.length === 0) {      
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const geometry = object.geometry;
          
          if (geometry instanceof THREE.PlaneGeometry ||
              geometry instanceof THREE.BufferGeometry ||
              geometry instanceof THREE.BufferGeometry) {
            
            walls.push(object);
          }
        }
      });
    }
    const intersects = raycaster.intersectObjects(walls, false);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      const hitObject = intersection.object;
      const wallName = hitObject.name;
      const point = intersection.point;
      const dimensions = this.getHouseDimensions();
      const isLShape = this.isLShapeHouse();
      const isUShape = this.isUShapeHouse(); 
      if (isLShape) {
        return this.identifyLShapeWall(point, dimensions, hitObject, intersection);
      } 
      else if (this.isTShapeHouse()) {
        return this.identifyTShapeWall(point, dimensions, hitObject, intersection);
      }
      else if (isUShape) { 
      return this.identifyUShapeWall(point, dimensions, hitObject, intersection);
    }
      else {
        return this.identifyStandardWall(point, dimensions, hitObject, intersection);
      }

    }
    return null;
  }

  private identifyUShapeWall(
  point: THREE.Vector3, 
  dimensions: { width: number, depth: number, wallHeight: number },
  hitObject: THREE.Object3D,
  intersection: THREE.Intersection
): { wall: string, position: number } | null {
  const uDimensions = this.getUShapeDimensions();
  const baseLength = uDimensions.baseLength;
  const baseWidth = uDimensions.baseWidth;
  const leftWingLength = uDimensions.leftWingLength;
  const leftWingWidth = uDimensions.leftWingWidth;
  const rightWingLength = uDimensions.rightWingLength;
  const rightWingWidth = uDimensions.rightWingWidth;
  const epsilon = 0.1;
  
  let wallType = '';
  let position = 0.5; 
  if (Math.abs(point.z) < epsilon && 
      point.x >= 0 && 
      point.x <= baseLength) {
    wallType = 'MainFront';
    position = point.x / baseLength;
  }
  else if (Math.abs(point.z - baseWidth) < epsilon && 
           point.x >= 0 && 
           point.x <= baseLength) {
    wallType = 'MainBack';
    position = point.x / baseLength;
  }
  
  else if (Math.abs(point.x) < epsilon && 
           point.z >= 0 && 
           point.z <= baseWidth) {
    wallType = 'MainLeft';
    position = point.z / baseWidth;
  }
  
  else if (Math.abs(point.x - baseLength) < epsilon && 
           point.z >= 0 && 
           point.z <= baseWidth) {
    wallType = 'MainRight';
    position = point.z / baseWidth;
  }
  else if (Math.abs(point.x) < epsilon && 
           point.z >= baseWidth && 
           point.z <= baseWidth + leftWingLength) {
    wallType = 'LeftWingLeft';
    position = (point.z - baseWidth) / leftWingLength;
  }
  else if (Math.abs(point.z - (baseWidth + leftWingLength)) < epsilon && 
           point.x >= 0 && 
           point.x <= leftWingWidth) {
    wallType = 'LeftWingFront';
    position = point.x / leftWingWidth;
  }
  
  else if (Math.abs(point.x - leftWingWidth) < epsilon && 
           point.z >= baseWidth && 
           point.z <= baseWidth + leftWingLength) {
    wallType = 'LeftWingBack';
    position = (point.z - baseWidth) / leftWingLength;
  }
  else if (Math.abs(point.x - baseLength) < epsilon && 
           point.z >= baseWidth && 
           point.z <= baseWidth + rightWingLength) {
    wallType = 'RightWingRight';
    position = (point.z - baseWidth) / rightWingLength;
  }
  
  else if (Math.abs(point.z - (baseWidth + rightWingLength)) < epsilon && 
           point.x >= (baseLength - rightWingWidth) && 
           point.x <= baseLength) {
    wallType = 'RightWingFront';
    position = (point.x - (baseLength - rightWingWidth)) / rightWingWidth;
  }
  else if (Math.abs(point.x - (baseLength - rightWingWidth)) < epsilon && 
           point.z >= baseWidth && 
           point.z <= baseWidth + rightWingLength) {
    wallType = 'RightWingBack';
    position = (point.z - baseWidth) / rightWingLength;
  }
  else {
    const faceNormal = intersection.face?.normal.clone();
    if (faceNormal) {
      faceNormal.applyQuaternion(hitObject.quaternion);
      
      if (Math.abs(faceNormal.z) > Math.abs(faceNormal.x)) {
        if (faceNormal.z > 0) {
          if (point.x >= 0 && point.x <= leftWingWidth && point.z > baseWidth) {
            wallType = 'LeftWingFront';
            position = point.x / leftWingWidth;
          } else if (point.x >= (baseLength - rightWingWidth) && point.x <= baseLength && point.z > baseWidth) {
            wallType = 'RightWingFront';
            position = (point.x - (baseLength - rightWingWidth)) / rightWingWidth;
          } else if (point.z <= baseWidth) {
            wallType = 'MainBack';
            position = point.x / baseLength;
          }
        } else {
          wallType = 'MainFront';
          position = point.x / baseLength;
        }
      } else {
        if (faceNormal.x > 0) {
          if (point.z > baseWidth) {
            wallType = 'LeftWingLeft';
            position = (point.z - baseWidth) / leftWingLength;
          } else {
            wallType = 'MainLeft';
            position = point.z / baseWidth;
          }
        } else {
          if (point.z > baseWidth) {
            if (point.x > baseLength - rightWingWidth) {
              wallType = 'RightWingRight';
              position = (point.z - baseWidth) / rightWingLength;
            } else {
              wallType = 'RightWingBack';
              position = (point.z - baseWidth) / rightWingLength;
            }
          } else {
            wallType = 'MainRight';
            position = point.z / baseWidth;
          }
        }
      }
    }
  }
  
  position = Math.max(0, Math.min(1, position));
  if (wallType) {
    return { wall: wallType, position };
  }
  
  return null;
}

private calculateUShapePosition(
  element: PlacedElement, 
  elementHeight: number
): THREE.Vector3 {
  const uDimensions = this.getUShapeDimensions();
  const baseLength = uDimensions.baseLength;
  const baseWidth = uDimensions.baseWidth;
  const leftWingLength = uDimensions.leftWingLength;
  const leftWingWidth = uDimensions.leftWingWidth;
  const rightWingLength = uDimensions.rightWingLength;
  const rightWingWidth = uDimensions.rightWingWidth;
  const offset = 0.09; 
  
  const positionNormalized = element.position;
  let position3D = new THREE.Vector3(0, elementHeight, 0);
  switch (element.wall) {
    case 'MainFront':
      position3D.set(
        positionNormalized * baseLength,      
        elementHeight,                       
        0 - offset                          
      );
      break;
      
    case 'MainBack':
      position3D.set(
        positionNormalized * baseLength,     
        elementHeight,                      
        baseWidth + offset                  
      );
      break;
      
    case 'MainLeft':
      position3D.set(
        0 - offset,                         
        elementHeight,                    
        positionNormalized * baseWidth     
      );
      break;
      
    case 'MainRight':
      position3D.set(
        baseLength + offset,                
        elementHeight,                     
        positionNormalized * baseWidth      
      );
      break;
      
    case 'LeftWingLeft':
      position3D.set(
        0 - offset,                                             
        elementHeight,                                          
        baseWidth + (positionNormalized * leftWingLength)     
      );
      break;
      
    case 'LeftWingFront':
      position3D.set(
        positionNormalized * leftWingWidth,                   
        elementHeight,                                          
        baseWidth + leftWingLength + offset                   
      );
      break;
      
    case 'LeftWingBack':
      position3D.set(
        leftWingWidth + offset,                                
        elementHeight,                                         
        baseWidth + (positionNormalized * leftWingLength)     
      );
      break;
      
    case 'RightWingRight':
      position3D.set(
        baseLength + offset,                                    
        elementHeight,                                         
        baseWidth + (positionNormalized * rightWingLength)   
      );
      break;
      
    case 'RightWingFront':
      position3D.set(
        (baseLength - rightWingWidth) + (positionNormalized * rightWingWidth), 
        elementHeight,                                                           
        baseWidth + rightWingLength + offset                                 
      );
      break;
      
    case 'RightWingBack':
      position3D.set(
        (baseLength - rightWingWidth) - offset,               
        elementHeight,                                        
        baseWidth + (positionNormalized * rightWingLength)    
      );
      break;
      
    default:
      console.warn(`Unknown wall type for U-shape house: ${element.wall}, using default position`);
      position3D.set(
        positionNormalized * baseLength,
        elementHeight,
        0 - offset
      );
  }
  
  return position3D;
}
private calculateUShapeRotation(wall: string): THREE.Vector3 {
  
  switch (wall) {
    case 'MainFront':
      return new THREE.Vector3(0, 0, 0);
      
    case 'MainBack':
      return new THREE.Vector3(0, Math.PI, 0);
      
    case 'MainLeft':
    case 'LeftWingLeft':
      return new THREE.Vector3(0, Math.PI / 2, 0);
      
    case 'MainRight':
    case 'RightWingRight':
      return new THREE.Vector3(0, -Math.PI / 2, 0);
      
    case 'LeftWingFront':
    case 'RightWingFront':
      return new THREE.Vector3(0, Math.PI, 0);
      
    case 'LeftWingBack':
    case 'RightWingBack':
      if (wall === 'LeftWingBack') {
        return new THREE.Vector3(0, -Math.PI / 2, 0); 
      } else {
        return new THREE.Vector3(0, Math.PI / 2, 0);  
      }
      
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}
  private isTShapeHouse(): boolean {
  if (!this.houseSpecs) {
    return false;
  }
  
  return this.houseSpecs.shapeType === HouseShapeType.TShape;
}

  
  private getTShapeDimensions(): { 
  mainWidth: number, 
  mainLength: number, 
  crossWidth: number, 
  crossLength: number 
} {
  const defaults = {
    mainWidth: 8,
    mainLength: 12,
    crossWidth: 6,
    crossLength: 6
  };
  
  if (!this.houseSpecs || !this.isTShapeHouse()) {
    return defaults;
  }
  
  const shapeParams = this.houseSpecs.shapeParameters || {};
  
  return {
    mainWidth: shapeParams['MainWidth'] || defaults.mainWidth,
    mainLength: shapeParams['MainLength'] || defaults.mainLength,
    crossWidth: shapeParams['CrossWidth'] || defaults.crossWidth,
    crossLength: shapeParams['CrossLength'] || defaults.crossLength
  };

}

private identifyTShapeWall(
  point: THREE.Vector3, 
  dimensions: { width: number, depth: number, wallHeight: number },
  hitObject: THREE.Object3D,
  intersection: THREE.Intersection
): { wall: string, position: number } | null {
  const tDimensions = this.getTShapeDimensions();
  const mainWidth = tDimensions.mainWidth;
  const mainLength = tDimensions.mainLength;
  const crossWidth = tDimensions.crossWidth;
  const crossLength = tDimensions.crossLength;
 
  const epsilon = 0.1;
  
  let wallType = '';
  let position = 0.5; 
  if (Math.abs(point.z + mainLength/2) < epsilon && 
      point.x >= -mainWidth/2 && 
      point.x <= mainWidth/2) {
    wallType = 'MainFront';
    position = (point.x + mainWidth/2) / mainWidth;
  }
  else if (Math.abs(point.x + mainWidth/2) < epsilon && 
           point.z >= -mainLength/2 && 
           point.z <= mainLength/2) {
    wallType = 'MainLeft';
    position = (point.z + mainLength/2) / mainLength;
  }
  else if (Math.abs(point.x - mainWidth/2) < epsilon && 
           point.z >= -mainLength/2 && 
           point.z <= mainLength/2) {
    wallType = 'MainRight';
    position = (point.z + mainLength/2) / mainLength;
  }
  
  else if (Math.abs(point.z - mainLength/2) < epsilon && 
           point.x >= -mainWidth/2 && 
           point.x <= -crossWidth/2) {
    wallType = 'MainBackLeft';
    position = (point.x + mainWidth/2) / ((mainWidth - crossWidth) / 2);
  }
  
  else if (Math.abs(point.z - mainLength/2) < epsilon && 
           point.x >= crossWidth/2 && 
           point.x <= mainWidth/2) {
    wallType = 'MainBackRight';
    position = (point.x - crossWidth/2) / ((mainWidth - crossWidth) / 2);
  }
  
  else if (Math.abs(point.z - (mainLength/2 + crossLength)) < epsilon && 
           point.x >= -crossWidth/2 && 
           point.x <= crossWidth/2) {
    wallType = 'CrossBack';
    position = (point.x + crossWidth/2) / crossWidth;
  }
  
  else if (Math.abs(point.x + crossWidth/2) < epsilon && 
           point.z >= mainLength/2 && 
           point.z <= mainLength/2 + crossLength) {
    wallType = 'CrossLeft';
    position = (point.z - mainLength/2) / crossLength;
  }
  
  else if (Math.abs(point.x - crossWidth/2) < epsilon && 
           point.z >= mainLength/2 && 
           point.z <= mainLength/2 + crossLength) {
    wallType = 'CrossRight';
    position = (point.z - mainLength/2) / crossLength;
  }
  
  else {
    const faceNormal = intersection.face?.normal.clone();
    if (faceNormal) {
      faceNormal.applyQuaternion(hitObject.quaternion);
      if (Math.abs(faceNormal.z) > Math.abs(faceNormal.x)) {
        if (faceNormal.z > 0) {
          if (point.z > mainLength/2 && point.x >= -crossWidth/2 && point.x <= crossWidth/2) {
            wallType = 'CrossBack';
            position = (point.x + crossWidth/2) / crossWidth;
          } 
          else if (point.z <= mainLength/2 && point.x < -crossWidth/2) {
            wallType = 'MainBackLeft';
            position = (point.x + mainWidth/2) / ((mainWidth - crossWidth) / 2);
          }
          else if (point.z <= mainLength/2 && point.x > crossWidth/2) {
            wallType = 'MainBackRight';
            position = (point.x - crossWidth/2) / ((mainWidth - crossWidth) / 2);
          }
        } else {
          wallType = 'MainFront';
          position = (point.x + mainWidth/2) / mainWidth;
        }
      } else {
        if (faceNormal.x > 0) {
          if (point.z > mainLength/2) {
            wallType = 'CrossLeft';
            position = (point.z - mainLength/2) / crossLength;
          } else {
            wallType = 'MainLeft';
            position = (point.z + mainLength/2) / mainLength;
          }
        } else {
          if (point.z > mainLength/2) {
            wallType = 'CrossRight';
            position = (point.z - mainLength/2) / crossLength;
          } else {
            wallType = 'MainRight';
            position = (point.z + mainLength/2) / mainLength;
          }
        }
      }
    }
  }
  
  position = Math.max(0, Math.min(1, position));  
  if (wallType) {
    return { wall: wallType, position };
  }
  
  return null;
}

private calculateTShapePosition(
  element: PlacedElement, 
  elementHeight: number
): THREE.Vector3 {

  const tDimensions = this.getTShapeDimensions();
  const mainWidth = tDimensions.mainWidth;
  const mainLength = tDimensions.mainLength;
  const crossWidth = tDimensions.crossWidth;
  const crossLength = tDimensions.crossLength;
  const offset = -0.09; 
  const positionNormalized = element.position;
  let position3D = new THREE.Vector3(0, elementHeight, 0);
  switch (element.wall) {
    case 'MainFront':
      position3D.set(
        (positionNormalized * mainWidth) - mainWidth/2, 
        elementHeight,                                 
        -mainLength/2 - offset                        
      );
      break;
      
    case 'MainLeft':
      position3D.set(
        -mainWidth/2 - offset,                        
        elementHeight,                             
        (positionNormalized * mainLength) - mainLength/2
      );
      break;
      
    case 'MainRight':
      position3D.set(
        mainWidth/2 + offset,                          
        elementHeight,                               
        (positionNormalized * mainLength) - mainLength/2 
      );
      break;
      
    case 'MainBackLeft':
      const backMainLeftWidth = (mainWidth - crossWidth) / 2;
      position3D.set(
        -mainWidth/2 + (positionNormalized * backMainLeftWidth), 
        elementHeight,                                          
        mainLength/2 + offset                                  
      );
      break;
      
    case 'MainBackRight':
      const backMainRightWidth = (mainWidth - crossWidth) / 2;
      position3D.set(
        crossWidth/2 + (positionNormalized * backMainRightWidth), 
        elementHeight,                                            
        mainLength/2 + offset                                    
      );
      break;
      
    case 'CrossBack':
      position3D.set(
        (positionNormalized * crossWidth) - crossWidth/2, 
        elementHeight,                                    
        mainLength/2 + crossLength + offset            
      );
      break;
      
    case 'CrossLeft':
      position3D.set(
        -crossWidth/2 - offset,                 
        elementHeight,                           
        mainLength/2 + (positionNormalized * crossLength) 
      );
      break;
      
    case 'CrossRight':
      position3D.set(
        crossWidth/2 + offset,                    
        elementHeight,                           
        mainLength/2 + (positionNormalized * crossLength) 
      );
      break;
      
    default:
      position3D.set(
        (positionNormalized * mainWidth) - mainWidth/2,
        elementHeight,
        -mainLength/2 - offset
      );
  }
  
  return position3D;
}

private calculateTShapeRotation(wall: string): THREE.Vector3 {
  
  switch (wall) {
    case 'MainFront':
      return new THREE.Vector3(0, 0, 0);
      
    case 'MainBackLeft':
    case 'MainBackRight':
      return new THREE.Vector3(0, Math.PI, 0);
      
    case 'MainLeft':
    case 'CrossLeft':
      return new THREE.Vector3(0, Math.PI / 2, 0);
      
    case 'MainRight':
    case 'CrossRight':
      return new THREE.Vector3(0, -Math.PI / 2, 0);
      
    case 'CrossBack':
      return new THREE.Vector3(0, Math.PI, 0);
      
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

  private identifyStandardWall(
    point: THREE.Vector3, 
    dimensions: { width: number, depth: number, wallHeight: number },
    hitObject: THREE.Object3D,
    intersection: THREE.Intersection
  ): { wall: string, position: number } | null {
    const halfWidth = dimensions.width / 2;
    const halfDepth = dimensions.depth / 2;
    
    const epsilon = 0.1;
    
    let wallType = '';
    let position = 0.5; 
    if (Math.abs(point.z + halfDepth) < epsilon) {
      wallType = 'MainFront';
      position = (point.x / dimensions.width) + 0.5;
    } 
    else if (Math.abs(point.z - halfDepth) < epsilon) {
      wallType = 'MainBack';
      position = (point.x / dimensions.width) + 0.5;
    } 
    else if (Math.abs(point.x + halfWidth) < epsilon) {
      wallType = 'MainLeft';
      position = (point.z / dimensions.depth) + 0.5;
    } 
    else if (Math.abs(point.x - halfWidth) < epsilon) {
      wallType = 'MainRight';
      position = (point.z / dimensions.depth) + 0.5;
    }
    else if (hitObject.name.toLowerCase().includes('front')) {
      wallType = 'MainFront';
      position = (point.x / dimensions.width) + 0.5;
    }
    else if (hitObject.name.toLowerCase().includes('back')) {
      wallType = 'MainBack';
      position = (point.x / dimensions.width) + 0.5;
    }
    else if (hitObject.name.toLowerCase().includes('left')) {
      wallType = 'MainLeft';
      position = (point.z / dimensions.depth) + 0.5;
    }
    else if (hitObject.name.toLowerCase().includes('right')) {
      wallType = 'MainRight';
      position = (point.z / dimensions.depth) + 0.5;
    }
    else {
      const faceNormal = intersection.face?.normal.clone();
      if (faceNormal) {
        faceNormal.applyQuaternion(hitObject.quaternion);
        
        if (Math.abs(faceNormal.z) > Math.abs(faceNormal.x)) {
          if (faceNormal.z > 0) {
            wallType = 'MainFront';
            position = (point.x / dimensions.width) + 0.5;
          } else {
            wallType = 'MainBack';
            position = (point.x / dimensions.width) + 0.5;
          }
        } else {
          if (faceNormal.x > 0) {
            wallType = 'MainLeft';
            position = (point.z / dimensions.depth) + 0.5;
          } else {
            wallType = 'MainRight';
            position = (point.z / dimensions.depth) + 0.5;
          }
        }
      }
    }
    
    position = Math.max(0, Math.min(1, position));
    if (wallType) {
      return { wall: wallType, position };
    }
    
    return null;
  }
  private identifyLShapeWall(
    point: THREE.Vector3, 
    dimensions: { width: number, depth: number, wallHeight: number, mainWidth?: number, mainLength?: number, extensionWidth?: number, extensionLength?: number },
    hitObject: THREE.Object3D,
    intersection: THREE.Intersection
  ): { wall: string, position: number } | null {
    const lDimensions = this.getLShapeDimensions();
    const mainWidth = lDimensions.mainWidth;
    const mainLength = lDimensions.mainLength;
    const extensionWidth = lDimensions.extensionWidth;
    const extensionLength = lDimensions.extensionLength;
    const epsilon = 0.1;
    let wallType = '';
    let position = 0.5;
    if (Math.abs(point.z - (extensionWidth - mainLength)) < epsilon && 
        point.x >= 0 && 
        point.x <= mainWidth) {
      wallType = 'MainBack';
      position = point.x / mainWidth;
    }
    else if (Math.abs(point.x) < epsilon && 
             point.z >= (extensionWidth - mainLength) && 
             point.z <= extensionWidth) {
      wallType = 'MainLeft';
      position = (point.z - (extensionWidth - mainLength)) / (mainLength - extensionWidth);
    }
    else if (Math.abs(point.x - mainWidth) < epsilon && 
             point.z >= (extensionWidth - mainLength) && 
             point.z <= extensionWidth) {
      wallType = 'MainRight';
      position = (point.z - (extensionWidth - mainLength)) / (mainLength - extensionWidth);
    }
    else if (Math.abs(point.z) < epsilon && 
             point.x >= (mainWidth - extensionLength) && 
             point.x <= mainWidth) {
      wallType = 'ExtensionFront';
      position = (point.x - (mainWidth - extensionLength)) / extensionLength;
    }
    else if (Math.abs(point.x - (mainWidth - extensionLength)) < epsilon && 
             point.z >= 0 && 
             point.z <= extensionWidth) {
      wallType = 'ExtensionLeft';
      position = point.z / extensionWidth;
    }
    else if (Math.abs(point.z - extensionWidth) < epsilon && 
             point.x >= (mainWidth - extensionLength) && 
             point.x <= mainWidth) {
      wallType = 'ExtensionBack';
      position = (point.x - (mainWidth - extensionLength)) / extensionLength;
    }
    else {
      const faceNormal = intersection.face?.normal.clone();
      if (faceNormal) {
        faceNormal.applyQuaternion(hitObject.quaternion);
      if (Math.abs(faceNormal.z) > Math.abs(faceNormal.x)) {
          if (faceNormal.z > 0) {
            if (point.x >= (mainWidth - extensionLength) && point.x <= mainWidth) {
              if (point.z < epsilon) {
                wallType = 'ExtensionFront';
                position = (point.x - (mainWidth - extensionLength)) / extensionLength;
              } else {
                wallType = 'ExtensionBack';
                position = (point.x - (mainWidth - extensionLength)) / extensionLength;
              }
            } else {
              wallType = 'MainFront';
              position = point.x / mainWidth;
            }
          } else {
            wallType = 'MainBack';
            position = point.x / mainWidth;
          }
        } else {
          if (faceNormal.x > 0) {
            if (point.z >= 0 && point.z <= extensionWidth) {
              wallType = 'ExtensionLeft';
              position = point.z / extensionWidth;
            } else {
              wallType = 'MainLeft';
              position = (point.z - (extensionWidth - mainLength)) / (mainLength - extensionWidth);
            }
          } else {
            wallType = 'MainRight';
            position = (point.z - (extensionWidth - mainLength)) / (mainLength - extensionWidth);
          }
        }
      }
    }
    
    position = Math.max(0, Math.min(1, position));
    if (wallType) {
      return { wall: wallType, position };
    }
    
    return null;
  }
  
  private async loadAndPositionModel(element: PlacedElement): Promise<void> {
    if (!this.loadedModels.has(element.path)) {
      try {
        const gltf = await this.loadGLTF(element.path);
        this.loadedModels.set(element.path, gltf.scene.clone());
      } catch (error) {
        console.error(`Error loading model from ${element.path}:`, error);
        throw error;
      }
    }
    
    const modelTemplate = this.loadedModels.get(element.path);
    if (!modelTemplate) {
      throw new Error(`Model template not found for ${element.path}`);
    }
    
    const modelInstance = modelTemplate.clone();
    modelInstance.name = element.id || 'default-id';
    
    if (!this.houseSpecs) {
      console.warn('House specifications not defined, using default placement');
    }
    
    const position3D = this.calculatePosition(element, this.houseSpecs);
    modelInstance.position.set(position3D.x, position3D.y, position3D.z);
    
    const rotation = this.calculateRotation(element.wall);
    modelInstance.rotation.set(rotation.x, rotation.y, rotation.z);
    
    const scale = element.scale || this.defaultScales[element.type] || { x: 1.0, y: 1.0, z: 1.0 };
    modelInstance.scale.set(scale.x, scale.y, scale.z);
    
    this.elementsGroup.add(modelInstance);
  }
  
  private loadGLTF(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => resolve(gltf),
        (progress) => console.log(`Loading ${path}: ${Math.round(progress.loaded / progress.total * 100)}%`),
        (error) => reject(error)
      );
    });
  }
  
  setHouseSpecs(houseSpecs: HouseSpecifications): void {
    this.houseSpecs = houseSpecs;
    this.updateAllElementPositions();
  }
  
  private updateAllElementPositions(): void {
    if (!this.houseSpecs) return;
    
    this.placedElements.forEach((element, id) => {
      const modelObject = this.elementsGroup.getObjectByName(id);
      if (modelObject) {
        const position3D = this.calculatePosition(element, this.houseSpecs);
        modelObject.position.copy(position3D);
      }
    });
  }
  private isLShapeHouse(): boolean {
    if (!this.houseSpecs) {
      return false;
    }
    
    return this.houseSpecs.shapeType === HouseShapeType.LShape;
  }

  private isUShapeHouse(): boolean {
  if (!this.houseSpecs) {
    return false;
  }
  
  return this.houseSpecs.shapeType === HouseShapeType.UShape;
}

private getUShapeDimensions(): { 
  baseLength: number, 
  baseWidth: number, 
  leftWingLength: number, 
  leftWingWidth: number,
  rightWingLength: number,
  rightWingWidth: number
} {
  const defaults = {
    baseLength: 10,
    baseWidth: 4,
    leftWingLength: 6,
    leftWingWidth: 4,
    rightWingLength: 6,
    rightWingWidth: 4
  };
  
  if (!this.houseSpecs || !this.isUShapeHouse()) {
    return defaults;
  }
  
  const shapeParams = this.houseSpecs.shapeParameters || {};
  
  return {
    baseLength: shapeParams['BaseLength'] || defaults.baseLength,
    baseWidth: shapeParams['BaseWidth'] || defaults.baseWidth,
    leftWingLength: shapeParams['LeftWingLength'] || defaults.leftWingLength,
    leftWingWidth: shapeParams['LeftWingWidth'] || defaults.leftWingWidth,
    rightWingLength: shapeParams['RightWingLength'] || defaults.rightWingLength,
    rightWingWidth: shapeParams['RightWingWidth'] || defaults.rightWingWidth
  };
}
  
  private getLShapeDimensions(): { 
    mainWidth: number, 
    mainLength: number, 
    extensionWidth: number, 
    extensionLength: number } {
    const defaults = {
      mainWidth: 8,
      mainLength: 12,
      extensionWidth: 6,
      extensionLength: 6
    };
    
    if (!this.houseSpecs || !this.isLShapeHouse()) {
      return defaults;
    }
    
    const shapeParams = this.houseSpecs.shapeParameters || {};
    
    return {
      mainWidth: shapeParams['MainWidth'] || defaults.mainWidth,
      mainLength: shapeParams['MainLength'] || defaults.mainLength,
      extensionWidth: shapeParams['ExtensionWidth'] || defaults.extensionWidth,
      extensionLength: shapeParams['ExtensionLength'] || defaults.extensionLength
    };
  }
  
  private getHouseDimensions(): { width: number, depth: number, wallHeight: number } {
    if (!this.houseSpecs) {
      return { width: 10, depth: 8, wallHeight: 3 };
    }
    
    let width, depth, wallHeight;
    
    if (this.houseSpecs.shapeType === HouseShapeType.Square) {
      const size = (this.houseSpecs.shapeParameters?.['Size'] as number) || 
                  (this.houseSpecs as any).size || 
                  (this.houseSpecs as any).Width || 
                  10;
      width = size;
      depth = size;
    } else if (this.houseSpecs.shapeType === HouseShapeType.Rectangular) {
      width = (this.houseSpecs.shapeParameters?.['Width'] as number) || 
              (this.houseSpecs as any).Width ||
              (this.houseSpecs.shapeParameters?.['width'] as number) || 
              (this.houseSpecs as any).width ||
              (this.houseSpecs.shapeParameters?.['MainWidth'] as number) || 
              (this.houseSpecs as any).MainWidth ||
              (this.houseSpecs as any).mainWidth || 
              10;
              
      depth = (this.houseSpecs.shapeParameters?.['Length'] as number) || 
              (this.houseSpecs as any).Length ||
              (this.houseSpecs.shapeParameters?.['length'] as number) || 
              (this.houseSpecs as any).length ||
              (this.houseSpecs.shapeParameters?.['MainLength'] as number) || 
              (this.houseSpecs as any).MainLength ||
              (this.houseSpecs as any).mainLength || 
              8;
      
    } else if (this.houseSpecs.shapeType === HouseShapeType.LShape) {
      const lDimensions = this.getLShapeDimensions();
      width = lDimensions.mainWidth;
      depth = lDimensions.mainLength;
      
    }else if (this.houseSpecs.shapeType === HouseShapeType.TShape) {
    const tDimensions = this.getTShapeDimensions();
    width = tDimensions.mainWidth;
    depth = tDimensions.mainLength;
    
  } else if (this.houseSpecs.shapeType === HouseShapeType.UShape) {
  const uDimensions = this.getUShapeDimensions();
  width = uDimensions.baseLength;
  depth = uDimensions.baseWidth + Math.max(uDimensions.leftWingLength, uDimensions.rightWingLength);
  
}else {
      width = 10;
      depth = 8;
    }
    
    wallHeight = (this.houseSpecs.shapeParameters?.['WallHeight'] as number) || 
                (this.houseSpecs as any).WallHeight ||
                (this.houseSpecs.shapeParameters?.['wallHeight'] as number) || 
                (this.houseSpecs as any).wallHeight ||
                (this.houseSpecs.shapeParameters?.['Height'] as number) || 
                (this.houseSpecs as any).Height ||
                (this.houseSpecs as any).height || 
                3;
    this.width = width;
    this.depth = depth;
    
    return { width, depth, wallHeight };
  }
  private calculatePosition(element: PlacedElement, houseSpecs?: HouseSpecifications): THREE.Vector3 {
  let elementHeight = element.type === 'door' ? 0 : 1.2;
  
  if (element.type === 'window' && element.position2 !== undefined) {
    elementHeight = 0.5 + (element.position2 ) * 2.0;
  }
  
  const offset = 0.09;
  
  const { width, depth, wallHeight } = this.getHouseDimensions();
  const isLShape = this.isLShapeHouse();
  const isTShape = this.isTShapeHouse();
  const isUShape = this.isUShapeHouse();
  
  if (isLShape) {
    return this.calculateLShapePosition(element, elementHeight);
  } 
  else if (isTShape) {
    return this.calculateTShapePosition(element, elementHeight);
  }
  else if (isUShape) {
  return this.calculateUShapePosition(element, elementHeight);
}
  else {
    return this.calculateStandardPosition(element, elementHeight, offset, width, depth);
  }
}
  private calculateStandardPosition(
    element: PlacedElement, 
    elementHeight: number, 
    offset: number, 
    width: number, 
    depth: number
  ): THREE.Vector3 {
    
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const positionNormalized = element.position;
    let position3D = new THREE.Vector3(0, elementHeight, 0);
    
    switch (element.wall) {
      case 'MainFront':
        position3D.set(
          (positionNormalized - 0.5) * width, 
          elementHeight,                      
          -halfDepth + offset               
        );
        break;
        
      case 'MainBack':
        position3D.set(
          (positionNormalized - 0.5) * width, 
          elementHeight,                    
          halfDepth - offset              
        );
        break;
        
      case 'MainLeft':
        position3D.set(
          -halfWidth + offset,                
          elementHeight,                    
          (positionNormalized - 0.5) * depth 
        );
        break;
        
      case 'MainRight':
        position3D.set(
          halfWidth - offset,               
          elementHeight,                      
          (positionNormalized - 0.5) * depth  
        );
        break;
        
      default:
        position3D.set(
          (positionNormalized - 0.5) * width,
          elementHeight,
          -halfDepth + offset
        );
    }
    
    return position3D;
  }
 
  private calculateLShapePosition(
    element: PlacedElement, 
    elementHeight: number, 
  ): THREE.Vector3 {
    const lDimensions = this.getLShapeDimensions();
    const mainWidth = lDimensions.mainWidth;
    const mainLength = lDimensions.mainLength;
    const extensionWidth = lDimensions.extensionWidth;
    const extensionLength = lDimensions.extensionLength;
    
    console.log(`Using L-shape dimensions for placement: mainWidth=${mainWidth}, mainLength=${mainLength}, extensionWidth=${extensionWidth}, extensionLength=${extensionLength}`);
    const offset = 0.02; 
    const offset1 = 0.19; 
    const positionNormalized = element.position;
    let position3D = new THREE.Vector3(0, elementHeight, 0);
    
    switch (element.wall) {
      case 'MainBack':
        position3D.set(
          mainWidth * positionNormalized,    
          elementHeight,                     
          (extensionWidth - mainLength ) - offset1 
        );
        break;
        
      case 'MainLeft':
       position3D.set(
          0 - offset,                          
          elementHeight,                  
          (extensionWidth - mainLength) + (mainLength - extensionWidth) * positionNormalized 
        );
        break;
        
      case 'MainRight':
        position3D.set(
          mainWidth+ offset,               
          elementHeight,                 
          (extensionWidth - mainLength) + (mainLength - extensionWidth) * positionNormalized  
        );
        break;
        
      case 'ExtensionFront':
        position3D.set(
          (mainWidth - extensionLength) + (extensionLength-mainWidth) * positionNormalized,  
          elementHeight,                      
          0 + offset1                          
        );
        break;
        
      case 'ExtensionLeft':
        position3D.set(
          (mainWidth - extensionLength) - offset, 
          elementHeight,                     
          extensionWidth * positionNormalized  
        );
        break;
        
      case 'ExtensionBack':
        position3D.set(
          (mainWidth - extensionLength) + extensionLength * positionNormalized,  
          elementHeight,                      
          extensionWidth + offset              
        );
        break;
        
      default:
        position3D.set(
          (mainWidth - extensionLength) + extensionLength * positionNormalized,
          elementHeight,
          0 + offset
        );
    }
    
    return position3D;
  }
  
  
  private calculateRotation(wall: string): THREE.Vector3 {
    let baseWall = '';
    
    if (wall.includes('Front')) baseWall = 'front';
    else if (wall.includes('Back')) baseWall = 'back';
    else if (wall.includes('Left')) baseWall = 'left';
    else if (wall.includes('Right')) baseWall = 'right';
      
    if (this.isTShapeHouse()) 
      return this.calculateTShapeRotation(wall);
    else
    if (this.isUShapeHouse()) {
  return this.calculateUShapeRotation(wall);
}
    if (this.isLShapeHouse()) {
      switch (wall) {
        case 'ExtensionFront':
          return new THREE.Vector3(0, 0, 0);
          
        case 'ExtensionLeft':
          return new THREE.Vector3(0, Math.PI / 2, 0);
          
        case 'ExtensionBack':
          return new THREE.Vector3(0, Math.PI, 0);
          
        case 'MainBack':
          return new THREE.Vector3(0, Math.PI, 0);
          
        case 'MainLeft':
          return new THREE.Vector3(0, Math.PI / 2, 0);
          
        case 'MainRight':
          return new THREE.Vector3(0, -Math.PI / 2, 0);
      }
    }
    
    switch (baseWall) {
      case 'front':
        return new THREE.Vector3(0, 0, 0); 
        
      case 'back':
        return new THREE.Vector3(0, Math.PI, 0); 
        
      case 'left':
        return new THREE.Vector3(0, Math.PI / 2, 0); 
        
      case 'right':
        return new THREE.Vector3(0, -Math.PI / 2, 0); 
        
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }
  
 selectWallWithRaycastForWindow(
  mouseX: number,
  mouseY: number,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
): { wall: string, position: number, position2: number } | null {
  const wallResult = this.selectWallWithRaycast(mouseX, mouseY, camera, renderer);
  
  if (!wallResult) return null;
  
  const canvas = renderer.domElement;
  const rect = canvas.getBoundingClientRect();
  
  const normalizedY = (mouseY - rect.top) / rect.height;
  const position2 = Math.max(0, Math.min(15, (1 - normalizedY)));
    
  return {
    wall: wallResult.wall,
    position: wallResult.position,
    position2: position2
  };
}

 
placeElementOnWall(
  element: Partial<PlacedElement> & Omit<PlacedElement, 'id'>,
  mouseX: number, 
  mouseY: number,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer
): Promise<string> {
  let wallHit;
  
  if (element.type === 'window') {
    wallHit = this.selectWallWithRaycastForWindow(mouseX, mouseY, camera, renderer);
    
    if (wallHit) {
      element.wall = wallHit.wall;
      element.position = wallHit.position;
      element.position2 = wallHit.position2;
      
    }
  } else {
    wallHit = this.selectWallWithRaycast(mouseX, mouseY, camera, renderer);
    
    if (wallHit) {
      element.wall = wallHit.wall;
      element.position = wallHit.position;
    }
  }
  
  if (wallHit) {
    return this.addElement(element);
  }
  
  return Promise.reject('No wall detected for placement');
}
  
}