import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailGeneratorService {

  constructor() {}
  generateThumbnail(
    scene: THREE.Scene, 
    camera: THREE.Camera, 
    renderer: THREE.WebGLRenderer,
    width: number = 300,
    height: number = 200
  ): Promise<string> {
    return new Promise((resolve) => {
      const originalSize = renderer.getSize(new THREE.Vector2());
      
      renderer.setSize(width, height);
      
      renderer.render(scene, camera);
      
      const canvas = renderer.domElement;
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      
      renderer.setSize(originalSize.x, originalSize.y);
      
      resolve(dataURL);
    });
  }

  generateOptimalThumbnail(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    width: number = 300,
    height: number = 200
  ): Promise<string> {
    return new Promise((resolve) => {
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 1.5;
      
      camera.position.set(
        center.x + distance * 0.7,
        center.y + distance * 0.5,
        center.z + distance * 0.7
      );
      
      camera.lookAt(center);
      
      this.generateThumbnail(scene, camera, renderer, width, height)
        .then(resolve);
    });
  }
}