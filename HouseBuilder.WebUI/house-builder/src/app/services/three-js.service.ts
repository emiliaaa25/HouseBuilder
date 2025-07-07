import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HouseShapeType, HouseSpecifications } from '../models/houseSpecifications.model';

@Injectable({
  providedIn: 'root'
})
export class ThreeJsService {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public controls!: OrbitControls;
  private house!: THREE.Group;
  
  constructor() { }

  isInitialized(): boolean {
    return !!(this.scene && this.camera && this.renderer && this.house);
  }

  initThreeJs(container: HTMLDivElement): void {
    if (!container) return;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);
    
    try {
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        canvas: document.createElement('canvas'),
        context: undefined,
        precision: 'highp',
        powerPreference: 'default',
        alpha: false,
        stencil: true
      });
      
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      container.appendChild(this.renderer.domElement);
      
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.house = new THREE.Group();
      this.scene.add(this.house);
      window.addEventListener('resize', this.onWindowResize.bind(this));
      
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      this.handleWebGLError(container);
      return;
    }
  }
  
  private handleWebGLError(container: HTMLDivElement): void {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    const errorElement = document.createElement('div');
    errorElement.style.width = '100%';
    errorElement.style.height = '100%';
    errorElement.style.display = 'flex';
    errorElement.style.alignItems = 'center';
    errorElement.style.justifyContent = 'center';
    errorElement.style.color = '#ff0000';
    errorElement.innerHTML = `
      <div style="text-align: center;">
        <h3>WebGL Error</h3>
        <p>Your browser does not support WebGL or it is disabled.</p>
        <p>Please enable WebGL in your browser settings or try a different browser.</p>
      </div>
    `;
    
    container.appendChild(errorElement);
  }
createScene(): void {
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  this.scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(15, 25, 15);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  directionalLight.shadow.bias = -0.0001; 
  this.scene.add(directionalLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-10, 10, -10);
  fillLight.castShadow = false; 
  this.scene.add(fillLight);
  const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.2);
  this.scene.add(hemisphereLight);
  const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
  gridHelper.material.opacity = 0.3;
  gridHelper.material.transparent = true;
  this.scene.add(gridHelper);
  const axesHelper = new THREE.AxesHelper(3);
  this.scene.add(axesHelper);
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
  this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure = 1.0;
}

  clearHouse(): void {
    if (this.house) {
      while (this.house.children.length > 0) {
        this.house.remove(this.house.children[0]);
      }
    }
  }
  
  getHouseGroup(): THREE.Group {
    return this.house;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize(): void {
    if (!this.renderer || !this.camera) return;
    
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
  
  
  positionCamera(houseSpecs: HouseSpecifications): void {
    if (!houseSpecs) return;
    
    let maxDimension = 10; 
    switch (houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        maxDimension = Math.max(
          (houseSpecs as any).Length || 10, 
          (houseSpecs as any).Width || 8
        );
        break;
      case HouseShapeType.Square:
        maxDimension = (houseSpecs as any).Size || 10;
        break;
      case HouseShapeType.LShape:
        maxDimension = Math.max(
          (houseSpecs as any).mainLength || 12,
          (houseSpecs as any).mainWidth || 8,
          (houseSpecs as any).extensionLength || 6
        );
        break;
      case HouseShapeType.TShape:
        maxDimension = Math.max(
          (houseSpecs as any).mainLength || 12,
          (houseSpecs as any).crossLength || 10
        );
        break;
      case HouseShapeType.UShape:
        maxDimension = Math.max(
          (houseSpecs as any).baseLength || 12,
          (houseSpecs as any).leftWingLength || 8,
          (houseSpecs as any).rightWingLength || 8
        );
        break;
    }
    const cameraDistance = maxDimension * 2;
    this.camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }
}