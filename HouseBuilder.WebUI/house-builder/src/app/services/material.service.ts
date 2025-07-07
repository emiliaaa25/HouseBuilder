import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MaterialSpecification, MaterialType } from '../models/materialSpecification.model';

export interface MaterialsCalculationResult {
  materials: Record<string, MaterialInfo>;
  costs: Record<string, CostInfo>;
  totalEstimatedCost: number;
}

export interface MaterialInfo {
  area?: number;
  volume?: number;
  material: string;
  unit: string;
  quantity: number;
  coverage?: number;
  extraPercentage: number;
}

export interface CostInfo {
  unitPrice: number;
  quantity: number;
  unit: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private textureLoader: THREE.TextureLoader;
  
  private textureCache: Map<string, THREE.Texture> = new Map<string, THREE.Texture>();
  
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }
  
  loadTexture(path: string): THREE.Texture {
    if (this.textureCache.has(path)) {
      return this.textureCache.get(path)!;
    }
    
    const texture = this.textureLoader.load(
      path, 
      (loadedTexture) => {
      }, 
      undefined, 
      (error) => {
        console.error(`Error loading texture: ${path}`, error);
        this.textureCache.set(path, this.createDefaultTexture());
      }
    );
    
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    this.textureCache.set(path, texture);
    return texture;
  }
  
  private createDefaultTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, 128, 128);
      context.fillStyle = '#cccccc';
      context.fillRect(0, 0, 64, 64);
      context.fillRect(64, 64, 64, 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  createMaterial(spec: MaterialSpecification): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color),
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.2
    });
    
    if (spec.texturePath && spec.texturePath.trim() !== '') {
      material.map = this.loadTexture(spec.texturePath);
      
      switch (spec.type) {
        case MaterialType.Metal:
          material.metalness = 0.8;
          material.roughness = 0.2;
          break;
        case MaterialType.Wood:
          material.roughness = 0.9;
          break;
        case MaterialType.Stone:
          material.roughness = 0.5;
          break;
        case MaterialType.Brick:
          material.roughness = 0.4;
          break;
        case MaterialType.Concrete:
          material.roughness = 0.8;
          break;
        case MaterialType.Tile:
          material.roughness = 0.4;
          break;
        case MaterialType.Stucco:
          material.roughness = 0.6;
          break;
        case MaterialType.Vinyl:
          material.roughness = 0.5;
          break;
        case MaterialType.MetalRoof:
          material.roughness = 0.2;
          material.metalness = 0.9;
          break;
        case MaterialType.Composite:
          material.roughness = 0.6;
          break;
        default:
          material.roughness = 0.5;
          break;
      }
    }
    
    return material;
  }

}