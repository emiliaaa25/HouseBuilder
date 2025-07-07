import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HouseShapeType, HouseSpecifications } from '../../models/houseSpecifications.model';
import { NavbarComponent } from "../navbar/navbar.component";
import { ActivatedRoute } from '@angular/router';
import { HouseSpecificationsService } from '../../services/houseSpecifications.service';
import { ThreeJsService } from '../../services/three-js.service';
import { HouseFactoryService } from '../../services/house-factory.service';
import { ExtrasService } from '../../services/extras.service';
import { DragDrop3dService } from '../../services/drag-and-drop.service';
import { Door,  Scale, Window } from '../../models/extras.model';
import { DEFAULT_SCALES, PlacedElement } from '../../models/element.model';
import { MaterialService } from '../../services/material.service';
import { PLATFORM_ID, Inject } from '@angular/core';
import { MaterialsCalculatorComponent } from '../materials-calculator/materials-calculator.component';

interface ConfigModalData {
  isEditing: boolean;
  type: 'door' | 'window';
  element?: Door | Window | PlacedElement;
  elementId?: string;
  wall: string;
  position: number;
  position2: number;
  scale: Scale;
}

interface PaginationState {
  doors: { currentPage: number; };
  windows: { currentPage: number; };
}

@Component({
  selector: 'house-model',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule, MaterialsCalculatorComponent],
  templateUrl: './house-model.component.html',
  styleUrls: ['./house-model.component.css']
})
export class HouseModelComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef<HTMLDivElement>;
  houseSpecs: HouseSpecifications | null = null;

  projectId: string = '';
  houseSpecsId: string = '';
  extrasId: string = '';
  showMaterialsModal: boolean = false;
  defaultScales = DEFAULT_SCALES;
  scaleLimits = {
    min: 0.0,
    max: 2.0
  };
  showSaveConfirmation: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';
  availableDoors: Door[] = [];
  availableWindows: Window[] = [];
  selectedElement: PlacedElement | null = null;
  dragDebug = {
    isDragging: false,
    lastDragEvent: null as DragEvent | null,
    dropTarget: null as HTMLElement | null
  };

  activeTab: 'doors' | 'windows' = 'doors';
  showConfigModal: boolean = false;
  itemsPerPage: number = 6;
  pagination: PaginationState = {
    doors: { currentPage: 1 },
    windows: { currentPage: 1 }
  };
  configModalData: ConfigModalData = {
    isEditing: false,
    type: 'door',
    wall: 'MainFront',
    position: 0.5,
    position2: 0.5,
    scale: { x: 1, y: 1, z: 1 }
  };

  constructor(
    private route: ActivatedRoute,
    private houseSpecsService: HouseSpecificationsService,
    private threeJsService: ThreeJsService,
    private houseFactoryService: HouseFactoryService,
    private dragDrop3dService: DragDrop3dService,
    public extrasService: ExtrasService,
    private materialsService: MaterialService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      this.houseSpecsId = params['houseSpecsId'];
      this.loadHouseSpecifications();
      
      if (this.houseSpecsId) {
        this.cleanupDuplicateExtras();
      }
    });
    
    this.initDemoData();
  }

  ngAfterViewInit(): void {
    if (this.rendererContainer) {
      this.threeJsService.initThreeJs(this.rendererContainer.nativeElement);
      this.threeJsService.createScene();
      this.dragDrop3dService.initialize(this.threeJsService.scene);
      this.threeJsService.animate();
      
      if (this.houseSpecs) {
        this.loadExtras();
      }
      
      this.rendererContainer.nativeElement.addEventListener('click', this.onRendererClick.bind(this));
      this.setupDragDropListeners();
    } else {
      console.error('Renderer container not found in the DOM');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.houseSpecs && this.threeJsService.isInitialized()) {
      this.createHouseModel();
    }
  }
  
  openMaterialsCalculator(): void {
    if (!this.houseSpecs) {
      this.errorMessage = 'House specifications are required to calculate materials.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }
    
    this.showMaterialsModal = true;
  }

  closeMaterialsCalculator(): void {
    this.showMaterialsModal = false;
  }

  private initDemoData(): void {
    this.availableDoors = [
      {
        id: 'door1', 
        path: 'assets/doors/door1.glb',
        thumbnail: 'assets/thumbnail/door1.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door2', 
        path: 'assets/doors/door2.glb',
        thumbnail: 'assets/thumbnail/door2.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door3', 
        path: 'assets/doors/door3.glb',
        thumbnail: 'assets/thumbnail/door3.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door4', 
        path: 'assets/doors/door4.glb',
        thumbnail: 'assets/thumbnail/door4.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door5',
        path: 'assets/doors/door5.glb',
        thumbnail: 'assets/thumbnail/door5.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door6',
        path: 'assets/doors/door6.glb',
        thumbnail: 'assets/thumbnail/door6.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door7',
        path: 'assets/doors/door7.glb',
        thumbnail: 'assets/thumbnail/door7.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door8',
        path: 'assets/doors/door8.glb',
        thumbnail: 'assets/thumbnail/door8.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door9',
        path: 'assets/doors/door9.glb',
        thumbnail: 'assets/thumbnail/door9.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door10',
        path: 'assets/doors/door10.glb',
        thumbnail: 'assets/thumbnail/door10.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door11',
        path: 'assets/doors/door11.glb',
        thumbnail: 'assets/thumbnail/door11.png',
        wall: 'MainFront',
        position: 0.5
      },
      {
        id: 'door12',
        path: 'assets/doors/door14.glb',
        thumbnail: 'assets/thumbnail/door14.png',
        wall: 'MainFront',
        position: 0.5
      }
    ];
    
    this.availableWindows = [
      {
        id: 'window1',
        path:  'assets/windows/window1.glb',
        wall: 'WallFront',
        position: 0.5,
        position2: 0.5,
        thumbnail: 'assets/thumbnail/window1.png'
      },
      {
        id: 'window2',
        path:  'assets/windows/window7.glb',
        wall: 'WallFront',
        position: 0.5,
        position2: 0.5,
        thumbnail: 'assets/thumbnail/window7.png'
      },
    ];
  }

  getAvailableWalls(): { value: string, name: string }[] {
    let baseWalls = [
      { value: 'MainFront', name: 'Front Wall' },
      { value: 'MainBack', name: 'Back Wall' },
      { value: 'MainLeft', name: 'Left Wall' },
      { value: 'MainRight', name: 'Right Wall' }
    ];
    
    if (this.houseSpecs?.shapeType === HouseShapeType.LShape) {
      baseWalls = [
        { value: 'MainLeft', name: 'Main Left' },
        { value: 'MainRight', name: 'Main Right' },
        { value: 'MainBack', name: 'Main Back' },
        { value: 'ExtensionFront', name: 'Extension Front' },
        { value: 'ExtensionBack', name: 'Extension Back' },
        { value: 'ExtensionLeft', name: 'Extension Left' },
      ];
    } else if (this.houseSpecs?.shapeType === HouseShapeType.TShape) {
      baseWalls = [
        { value: 'MainFront', name: 'Main Front' },
        { value: 'MainLeft', name: 'Main Left' },
        { value: 'MainRight', name: 'Main Right' },
        { value: 'MainBackLeft', name: 'Main Back Left' },
        { value: 'MainBackRight', name: 'Main Back Right' },
        { value: 'CrossBack', name: 'Cross Back' },
        { value: 'CrossRight', name: 'Cross Right' },
        { value: 'CrossLeft', name: 'Cross left' }
      ];
    } else if (this.houseSpecs?.shapeType === HouseShapeType.UShape) {
      baseWalls = [
        { value: 'MainFront', name: 'Front Wall' },
      { value: 'MainBack', name: 'Back Wall' },
      { value: 'MainLeft', name: 'Left Wall' },
      { value: 'MainRight', name: 'Right Wall' },
        { value: 'LeftWingFront', name: 'Left Wing Front' },
        { value: 'LeftWingBack', name: 'Left Wing Back' },
        { value: 'LeftWingLeft', name: 'Left Wing Left' },
        { value: 'RightWingFront', name: 'Right Wing Front' },
        { value: 'RightWingBack', name: 'Right Wing Back' },
        { value: 'RightWingRight', name: 'Right Wing Right' }
      ];
    }
    
    return [...baseWalls];
  }

  cleanupDuplicateExtras(): void {
    if (!this.houseSpecsId) return;
    
    this.extrasService.cleanupDuplicateExtras(this.houseSpecsId).subscribe({
      next: (result) => {
        if (result.success && result.keepId) {
          this.extrasId = result.keepId;
        }
      },
      error: (error) => {
        console.error('Error cleaning up duplicate extras:', error);
      }
    });
  }

  loadHouseSpecifications(): void {
    this.loading = true;
    this.houseSpecsService.getById(this.houseSpecsId, this.projectId).subscribe({
      next: (specs) => {
        this.houseSpecs = specs;
        this.loading = false;  
        if (this.houseSpecs && this.threeJsService.isInitialized()) {
          this.createHouseModel();
          this.loadExtras();
        }
      },
      error: (error) => {
        this.errorMessage = 'Could not load house specifications.';
        this.loading = false;
        console.error('Error loading house specs:', error);
      }
    });
  }

  private createHouseModel(): void {
    if (!this.houseSpecs) return;
    
    this.threeJsService.clearHouse();
    this.houseFactoryService.createHouseModel(this.houseSpecs);
    this.threeJsService.positionCamera(this.houseSpecs);
    this.dragDrop3dService.setHouseSpecs(this.houseSpecs);
  }

  loadExtras(): void {
    if (!this.houseSpecsId) return;    
    this.extrasService.getExtras(this.houseSpecsId).subscribe({
      next: (extras) => {        
        if (extras && extras.length > 0) {
          const extrasData = extras[0];
          this.extrasId = extrasData.id || '';
          this.dragDrop3dService.clearAll();
          
          if (extrasData.doors && Array.isArray(extrasData.doors) && extrasData.doors.length > 0) {
            extrasData.doors.forEach((door: any) => {
              try {
                const doorModel = this.availableDoors.find(d => d.path === door.path);
                if (doorModel) {
                  const scale = this.ensureProperCasingForScale(door.scale);
                  
                  const elementData: any = {
                    id: door.id,
                    type: 'door',
                    modelId: doorModel.id || '',
                    wall: door.wall,
                    position: door.position,
                    path: door.path,
                    thumbnail: door.thumbnail || doorModel.thumbnail || '',
                    scale: scale || this.defaultScales.door
                  };
                  
                  this.dragDrop3dService.addElement(elementData);
                }
              } catch (error) {
                console.error('Error adding door:', error, door);
              }
            });
          }
          
          if (extrasData.windows && Array.isArray(extrasData.windows) && extrasData.windows.length > 0) {
            extrasData.windows.forEach((window: any) => {
              try {
                const windowModel = this.availableWindows.find((w: any) => w.path === window.path);
                if (windowModel) {
                  const scale = this.ensureProperCasingForScale(window.scale);
                  
                  const elementData: any = {
                    id: window.id,
                    type: 'window',
                    modelId: windowModel.id || '',
                    wall: window.wall,
                    position: window.position,
                    position2: window.position2 || 0.5,
                    path: window.path,
                    thumbnail: window.thumbnail || windowModel.thumbnail || '',
                    scale: scale || this.defaultScales.window
                  };
                  
                  this.dragDrop3dService.addElement(elementData);
                }
              } catch (error) {
                console.error('Error adding window:', error, window);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error loading extras:', error);
      }
    });
  }

  private ensureProperCasingForScale(scale: any): Scale | null {
    if (!scale) return null;
    
    if (scale.X !== undefined || scale.Y !== undefined || scale.Z !== undefined) {
      return {
        x: scale.X !== undefined ? scale.X : 1.0,
        y: scale.Y !== undefined ? scale.Y : 1.0,
        z: scale.Z !== undefined ? scale.Z : 1.0
      };
    }
    
    return scale;
  }

  onDragStart(event: DragEvent, type: 'door' | 'window', model: Door | Window): void {
    if (!event.dataTransfer) return;
    
    const dragData = JSON.stringify({
      type,
      modelId: model.id,
      path: model.path,
      thumbnail: model.thumbnail
    });
    
    this.dragDebug.isDragging = true;
    this.dragDebug.lastDragEvent = event;
    
    event.dataTransfer.setData('text/plain', dragData);
    event.dataTransfer.effectAllowed = 'copy';
    
    try {
      const dragImg = new Image();
      dragImg.src = model.thumbnail || '/assets/generic-element.png';
      event.dataTransfer.setDragImage(dragImg, 25, 25);
    } catch (error) {
      console.warn('Could not set drag image', error);
    }
  }

  private setupDragDropListeners(): void {
    if (!this.rendererContainer || !this.rendererContainer.nativeElement) {
      console.error('Renderer container not available for setting up drag and drop');
      return;
    }
    
    const container = this.rendererContainer.nativeElement;
    
    container.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault();
      
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      
      container.classList.add('drag-over');
      this.dragDebug.lastDragEvent = event;
    });
    
    container.addEventListener('dragleave', (event: DragEvent) => {
      container.classList.remove('drag-over');
    });
    
    container.addEventListener('drop', this.onDrop.bind(this));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();    
    if (this.rendererContainer && this.rendererContainer.nativeElement) {
      this.rendererContainer.nativeElement.classList.remove('drag-over');
    }
    
    this.dragDebug.isDragging = false;
    this.dragDebug.dropTarget = event.target as HTMLElement;
    
    if (!event.dataTransfer) {
      console.error('No dataTransfer in drop event');
      return;
    }
    
    const dataStr = event.dataTransfer.getData('text/plain');
    if (!dataStr) {
      console.error('No data received in drop event');
      return;
    }
    
    try {
      const data = JSON.parse(dataStr);
      console.log('Dropped element data:', data);
      
      const renderer = this.threeJsService.renderer;
      if (!renderer) {
        console.error('Renderer not available');
        return;
      }
      
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const percentX = Math.max(0, Math.min(1, x / rect.width));
      const percentY = Math.max(0, Math.min(1, y / rect.height));
      
      const availableWalls = this.getAvailableWalls();
      
      let wallValue: string;
      let position = 0.5;
      
      if (percentX < 0.33) {
        wallValue = 'MainLeft';
        position = Math.max(0.1, Math.min(0.9, percentY));
      } else if (percentX > 0.66) {
        wallValue = 'MainRight';
        position = Math.max(0.1, Math.min(0.9, percentY));
      } else if (percentY < 0.33) {
        wallValue = 'MainBack';
        position = Math.max(0.1, Math.min(0.9, 1 - percentX));
      } else {
        wallValue = 'MainFront';
        position = Math.max(0.1, Math.min(0.9, percentX));
      }
      
      const selectedWall = availableWalls.find(w => w.value === wallValue);
      if (!selectedWall) {
        console.warn(`Wall ${wallValue} not found in available walls, defaulting to MainFront`);
        wallValue = 'MainFront';
      }
      let originalElement: Door | Window | undefined;
      if (data.type === 'door') {
        originalElement = this.availableDoors.find(d => d.id === data.modelId);
      } else {
        originalElement = this.availableWindows.find(w => w.id === data.modelId);
      }
      
      if (!originalElement) {
        console.error('Original element not found');
        return;
      }
      this.configModalData = {
        isEditing: false,
        type: data.type,
        element: originalElement,
        wall: wallValue,
        position: position,
        position2: 0.5,
        scale: data.type === 'door' ? { ...this.defaultScales.door } : { ...this.defaultScales.window }
      };
      
      this.showConfigModal = true;
      
    } catch (error) {
      console.error('Error processing dropped element:', error);
      this.errorMessage = 'Error processing element.';
    }
  }

  onRendererClick(event: MouseEvent): void {
    if (!this.threeJsService.renderer || !this.threeJsService.camera) return;
    
    const rect = this.threeJsService.renderer.domElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const element = this.dragDrop3dService.selectElementWithRaycast(
      mouseX, 
      mouseY, 
      this.threeJsService.camera, 
      this.threeJsService.renderer
    );
    
    this.selectedElement = element;    
    if (this.selectedElement && !this.selectedElement.scale) {
      const defaultScale = this.selectedElement.type === 'door' 
        ? this.defaultScales.door 
        : this.defaultScales.window;
      
      this.selectedElement.scale = { ...defaultScale };
    }
    if (this.selectedElement) {
      this.configModalData = {
        isEditing: true,
        type: this.selectedElement.type as 'door' | 'window',
        element: this.selectedElement,
        elementId: this.selectedElement.id,
        wall: this.selectedElement.wall,
        position: this.selectedElement.position,
        position2: (this.selectedElement as any).position2 || 0.5,
        scale: this.selectedElement.scale ? { ...this.selectedElement.scale } : 
               (this.selectedElement.type === 'door' ? { ...this.defaultScales.door } : { ...this.defaultScales.window })
      };
      
      this.showConfigModal = true;
    }
  }
  initializeScaleIfNeeded(): boolean {
    if (!this.selectedElement) {
      return false;
    }
  
    if (!this.selectedElement.scale) {
      const defaultScale = this.selectedElement.type === 'door' 
        ? { ...this.defaultScales.door } 
        : { ...this.defaultScales.window };
      
      this.selectedElement.scale = defaultScale;
    }
  
    return !!this.selectedElement.scale;
  }
  
  updateElementPosition(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;
    
    if (this.selectedElement.type === 'window') {
      this.dragDrop3dService.updateElementPosition(
        this.selectedElement.id,
        this.selectedElement.wall,
        this.selectedElement.position,
        this.selectedElement.position2
      );
    } else {
      this.dragDrop3dService.updateElementPosition(
        this.selectedElement.id,
        this.selectedElement.wall,
        this.selectedElement.position
      );
    }
    
    this.saveChanges();
  }
  
  updateElementScale(): void {
    if (!this.selectedElement || !this.selectedElement.id || !this.selectedElement.scale) {
      return;
    }
    
    this.dragDrop3dService.updateElementScale(
      this.selectedElement.id,
      this.selectedElement.scale
    );
    
    this.saveChanges();
  }
  
  resetElementScale(): void {
    if (!this.selectedElement || !this.selectedElement.id) {
      return;
    }
    
    const defaultScale = this.selectedElement.type === 'door' 
      ? { ...this.defaultScales.door } 
      : { ...this.defaultScales.window };
    
    this.selectedElement.scale = defaultScale;
    
    this.dragDrop3dService.updateElementScale(
      this.selectedElement.id,
      defaultScale
    );
    
    this.saveChanges();
  }

  removeElement(): void {
    if (!this.selectedElement || !this.selectedElement.id) return;
    this.dragDrop3dService.removeElement(this.selectedElement.id);
    this.selectedElement = null;
    this.saveChanges();
  }

  saveChanges(): void {
    if (!this.houseSpecsId) {
      console.error('Cannot save changes: houseSpecsId is missing');
      return;
    }
    this.showSaveConfirmation = true;
    const placedElements = this.dragDrop3dService.getPlacedElements();
     
    const doors = placedElements
      .filter(el => el.type === 'door')
      .map(door => ({
        id: door.id,
        wall: door.wall,
        position: door.position,
        path: door.path,
        thumbnail: door.thumbnail,
        scale: door.scale
      }));
    
    const windows = placedElements
      .filter(el => el.type === 'window')
      .map(window => ({
        id: window.id,
        wall: window.wall,
        position: window.position,
        position2: window.position2,
        path: window.path,
        thumbnail: window.thumbnail,
        scale: window.scale
      }));
    
    const extras: any = {
      id: this.extrasId,
      houseSpecificationsId: this.houseSpecsId,
      doors,
      windows
    };

    if (this.extrasId) {
      this.extrasService.update(this.extrasId, extras).subscribe({
        next: () => {
          console.log('Extras updated successfully');
        },
        error: (error) => {
          console.error('Error updating extras:', error);
          this.errorMessage = 'Could not update elements.';
        }
      });
    } else {
      this.extrasService.create(extras).subscribe({
        next: (result) => {
          console.log('Extras created successfully');
          this.extrasId = result.data;
        },
        error: (error) => {
          console.error('Error creating extras:', error);
          this.errorMessage = 'Could not save elements.';
        }
      });
    }
  }
  setActiveTab(tab: 'doors' | 'windows'): void {
    this.activeTab = tab;
  }

  getCurrentPageItems(type: 'doors' | 'windows'): (Door | Window)[] {
    const items = type === 'doors' ? this.availableDoors : this.availableWindows;
    const currentPage = this.pagination[type].currentPage;
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  getTotalPages(type: 'doors' | 'windows'): number {
    const items = type === 'doors' ? this.availableDoors : this.availableWindows;
    return Math.ceil(items.length / this.itemsPerPage);
  }

  nextPage(type: 'doors' | 'windows'): void {
    const totalPages = this.getTotalPages(type);
    if (this.pagination[type].currentPage < totalPages) {
      this.pagination[type].currentPage++;
    }
  }

  previousPage(type: 'doors' | 'windows'): void {
    if (this.pagination[type].currentPage > 1) {
      this.pagination[type].currentPage--;
    }
  }

  openElementConfigModal(type: 'door' | 'window', element?: Door | Window | PlacedElement): void {
    this.configModalData = {
      isEditing: false,
      type: type,
      element: element,
      wall: 'MainFront',
      position: 0.5,
      position2: 0.5,
      scale: type === 'door' ? { ...this.defaultScales.door } : { ...this.defaultScales.window }
    };
    
    this.showConfigModal = true;
  }

  closeConfigModal(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showConfigModal = false;
  }
  onModalWallChange(): void {
    if (this.configModalData.isEditing && this.selectedElement) {
      this.selectedElement.wall = this.configModalData.wall;
      this.updateElementPosition();
    }
  }

  onModalPositionChange(): void {
    if (this.configModalData.isEditing && this.selectedElement) {
      this.selectedElement.position = this.configModalData.position;
      if (this.configModalData.type === 'window') {
        this.selectedElement.position2 = this.configModalData.position2;
      }
      this.updateElementPosition();
    }
  }

  onModalScaleChange(): void {
    if (this.configModalData.isEditing && this.selectedElement && this.selectedElement.scale) {
      this.selectedElement.scale.x = this.configModalData.scale.x;
      this.selectedElement.scale.y = this.configModalData.scale.y;
      this.selectedElement.scale.z = this.configModalData.scale.z;
      this.updateElementScale();
    }
  }

  resetModalScale(): void {
    const defaultScale = this.configModalData.type === 'door' 
      ? { ...this.defaultScales.door } 
      : { ...this.defaultScales.window };
    this.configModalData.scale = defaultScale;
    if (this.configModalData.isEditing && this.selectedElement) {
      this.selectedElement.scale = { ...defaultScale };
      this.updateElementScale();
    }
  }

  applyElementConfig(): void {
    if (this.configModalData.isEditing) {
      this.closeConfigModal();
    } else {
      this.addNewElementFromModal();
      this.closeConfigModal();
    }
  }

  private addNewElementFromModal(): void {
    if (!this.configModalData.element) return;
    
    let originalElement: Door | Window | undefined;
    if (this.configModalData.type === 'door') {
      originalElement = this.availableDoors.find(d => d.id === (this.configModalData.element as Door).id);
    } else {
      originalElement = this.availableWindows.find(w => w.id === (this.configModalData.element as Window).id);
    }
    
    if (!originalElement) {
      console.error('Original element not found');
      return;
    }
    
    const elementId = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const elementData: any = {
      id: elementId,
      type: this.configModalData.type,
      modelId: originalElement.id,
      wall: this.configModalData.wall,
      position: this.configModalData.position,
      path: originalElement.path,
      thumbnail: originalElement.thumbnail,
      scale: { ...this.configModalData.scale }
    };
    
    if (this.configModalData.type === 'window') {
      elementData.position2 = this.configModalData.position2;
    }
    
    this.dragDrop3dService.addElement(elementData).then(addedElementId => {
      this.saveChanges();
    }).catch(error => {
      console.error('Failed to add element:', error);
      this.errorMessage = 'Could not add element.';
    });
  }

  deleteElementFromModal(): void {
    if (this.configModalData.isEditing && this.selectedElement) {
      this.removeElement();
      this.closeConfigModal();
    }
  }
}