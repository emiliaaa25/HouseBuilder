import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { ThreeJsService } from './three-js.service';
import { MaterialService } from './material.service';
import { SquareHouseModel } from '../models/square-house.model';
import { LShapeHouseModel } from '../models/l-shape-house.model';
import { HouseShapeType, HouseSpecifications } from '../models/houseSpecifications.model';
import { TShapeHouseModel } from '../models/t-shape-house.model';
import { UShapeHouseModel } from '../models/u-shape-house.model';
import { RectangularHouseModel } from '../models/rectangular-house.model';

@Injectable({
  providedIn: 'root'
})
export class HouseFactoryService {
  houseSpecs: any;
  
  constructor(
    private threeJsService: ThreeJsService,
    private materialService: MaterialService,
  ) { }
  
  createHouseModel(houseSpecs: HouseSpecifications): void {
    if (!houseSpecs) return;
    
    const houseGroup = this.threeJsService.getHouseGroup();
    
    switch (houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        const rectangularHouse = new RectangularHouseModel(
          houseSpecs, 
          this.materialService, 
        this,
        );
        rectangularHouse.build(houseGroup);
        break;
        
      case HouseShapeType.Square:
        const squareHouse = new SquareHouseModel(
          houseSpecs, 
          this.materialService, 
        this,
        );
        squareHouse.build(houseGroup);
        break;
        
      case HouseShapeType.LShape:
        const lShapeHouse = new LShapeHouseModel(
          houseSpecs, 
          this.materialService, 
          this,
        );
        lShapeHouse.build(houseGroup);
        break;
        
      case HouseShapeType.TShape:
        const tShapeHouse = new TShapeHouseModel(
          houseSpecs, 
          this.materialService, 
          this,
        );
        tShapeHouse.build(houseGroup);
        break;
        
      case HouseShapeType.UShape:
        const uShapeHouse = new UShapeHouseModel(
          houseSpecs, 
          this.materialService, 
          this,
        );
        uShapeHouse.build(houseGroup);
        break;
        
      default:
        const defaultHouse = new RectangularHouseModel(
          houseSpecs, 
          this.materialService, 
          this
        );
        defaultHouse.build(houseGroup);
    }
  }
  

  public calculateTotalHeight(houseSpecs: HouseSpecifications): number {
    
    let totalHeight = 0;
    for (const floor of houseSpecs.floors) {
      totalHeight += floor.floorHeigth || 3; 
    }
    return totalHeight;
  }
  getWallMaterial(houseSpecs: HouseSpecifications, wallPosition: string): THREE.MeshStandardMaterial {
    if (!houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0x33ccff, side: THREE.DoubleSide });
    }
    
    if (houseSpecs.materialCustomizations) {
      try {
        const customizations = JSON.parse(houseSpecs.materialCustomizations);
        if (customizations[wallPosition]) {
          return this.materialService.createMaterial(customizations[wallPosition]);
        }
      } catch (e) {
        console.error('Error parsing material customizations:', e);
      }
    }
    
    return this.materialService.createMaterial(houseSpecs.wallMaterial);
  }

  getRoofMaterial(houseSpecs: HouseSpecifications): THREE.MeshStandardMaterial {
    if (!houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0xff5500, side: THREE.DoubleSide });
    }
    
    return this.materialService.createMaterial(houseSpecs.roofMaterial);
  }

  getFloorMaterial(houseSpecs: HouseSpecifications): THREE.MeshStandardMaterial {
    if (!houseSpecs) {
      return new THREE.MeshStandardMaterial({ color: 0x999999, side: THREE.DoubleSide });
    }
    
    return this.materialService.createMaterial(houseSpecs.floorMaterial);
  }
}