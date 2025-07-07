import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicProjectService, PublicProjectDto } from '../../services/public-project.service';
import { HouseSpecificationsService } from '../../services/houseSpecifications.service';
import { ExtrasService } from '../../services/extras.service'; 
import { DragDrop3dService } from '../../services/drag-and-drop.service'; 
import { ThreeJsService } from '../../services/three-js.service';
import { HouseFactoryService } from '../../services/house-factory.service';
import { HouseSpecifications } from '../../models/houseSpecifications.model';
import { Extras, Door, Window, Scale } from '../../models/extras.model'; 
import { DEFAULT_SCALES } from '../../models/element.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-gallery-view',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.css']
})
export class GalleryViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gallery3dContainer', { static: false }) threeDContainer!: ElementRef<HTMLDivElement>;
  publicProjectId: string = '';
  publicProject: PublicProjectDto | null = null;
  houseSpecs: HouseSpecifications | null = null;
  loading = true;
  error = '';
  currentUserId: string = '';
  availableDoors: Door[] = [];
  availableWindows: Window[] = [];
  extrasId: string = '';
  private viewInitialized = false;
  public dataLoaded = false;
  public extrasLoaded = false; 
  public threeDInitialized = false;
  private initializationAttempts = 0;
  private maxAttempts = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicProjectService: PublicProjectService,
    private houseSpecsService: HouseSpecificationsService,
    private extrasService: ExtrasService, 
    private dragDrop3dService: DragDrop3dService, 
    private threeJsService: ThreeJsService,
    private houseFactoryService: HouseFactoryService
  ) {}

  ngOnInit(): void {
    this.currentUserId = sessionStorage.getItem('userId') || '';
    
    this.route.params.subscribe(params => {
      this.publicProjectId = params['id'];
      this.loadPublicProject();
    });
    this.initDemoData();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    console.log('View initialized');
    this.tryInitialize3D();
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
     
    ];
    
    this.availableWindows = [
      {
        id: 'window1',
        path: 'assets/windows/window1.glb',
        wall: 'WallFront',
        position: 0.5,
        position2: 0.5,
        thumbnail: 'assets/thumbnail/window1.png'
      },
      {
        id: 'window2',
        path: 'assets/windows/window7.glb',
        wall: 'WallFront',
        position: 0.5,
        position2: 0.5,
        thumbnail: 'assets/thumbnail/window7.png'
      },
    ];
  }

  loadPublicProject(): void {
    this.loading = true;
    this.publicProjectService.getPublicProject(this.publicProjectId, this.currentUserId).subscribe({
      next: (project) => {
        if (project) {
          this.publicProject = project;
          this.loadHouseSpecifications();
        } else {
          this.error = 'Public project not found.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load project details.';
        this.loading = false;
        console.error('Error loading public project:', error);
      }
    });
  }

  loadHouseSpecifications(): void {
    if (!this.publicProject) return;
    this.houseSpecsService.getHouseSpecifications(this.publicProject.projectId).subscribe({
      next: (specs) => {
        if (specs && specs.length > 0) {
          this.houseSpecs = specs[0];
          this.dataLoaded = true;
          this.loadExtras();
        } else {
          this.error = 'House specifications not found for this project.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load house specifications.';
        this.loading = false;
        console.error('Error loading house specs:', error);
      }
    });
  }

  loadExtras(): void {
    if (!this.houseSpecs?.id) {
      this.extrasLoaded = true;
      this.loading = false;
      this.tryInitialize3D();
      return;
    }
    
    this.extrasService.getExtras(this.houseSpecs.id).subscribe({
      next: (extras) => {
        this.extrasLoaded = true;
        this.loading = false;
        
        if (extras && extras.length > 0) {
          const extrasData = extras[0];
          this.extrasId = extrasData.id || '';
        }
        this.tryInitialize3D();
      },
      error: (error) => {
        console.log('No extras found or error loading extras:', error);
        this.extrasLoaded = true;
        this.loading = false;
        this.tryInitialize3D();
      }
    });
  }

  private tryInitialize3D(): void {
    this.initializationAttempts++;
    if (this.viewInitialized && 
        this.dataLoaded && 
        this.extrasLoaded && 
        this.houseSpecs && 
        !this.loading && 
        !this.threeDInitialized) {
      
      if (this.threeDContainer?.nativeElement) {
        setTimeout(() => {
          this.init3DView();
        }, 100);
      } else {
        if (this.initializationAttempts < this.maxAttempts) {
          setTimeout(() => {
            this.tryInitialize3D();
          }, 200);
        } else {
          console.error('Max initialization attempts reached, container still not available');
          this.error = 'Failed to initialize 3D view - container not found.';
        }
      }
    }
  }

  private init3DView(): void {
    if (!this.threeDContainer?.nativeElement) {
      console.error('3D container not found');
      this.error = 'Failed to initialize 3D view - container not found.';
      return;
    }

    try {
      console.log('Initializing ThreeJS...');
      
      this.threeJsService.initThreeJs(this.threeDContainer.nativeElement);
      this.threeJsService.createScene();
      this.dragDrop3dService.initialize(this.threeJsService.scene);
      this.dragDrop3dService.setHouseSpecs(this.houseSpecs!);
      this.threeJsService.animate();
      this.threeDInitialized = true;
      this.create3DModel();
      this.loadAndDisplay3DExtras(); 
    } catch (error) {
      console.error('Error initializing 3D view:', error);
      this.error = 'Failed to initialize 3D view: ' + (error as Error).message;
    }
  }

  private create3DModel(): void {
    if (!this.houseSpecs || !this.threeJsService.isInitialized()) {
      console.error('Cannot create 3D model - missing requirements');
      return;
    }
    
    try {
      this.threeJsService.clearHouse();
      this.houseFactoryService.createHouseModel(this.houseSpecs);
      this.threeJsService.positionCamera(this.houseSpecs);
    } catch (error) {
      console.error('Error creating 3D model:', error);
      this.error = 'Failed to create 3D model: ' + (error as Error).message;
    }
  }

  private loadAndDisplay3DExtras(): void {
    if (!this.houseSpecs?.id || !this.dragDrop3dService) {
      return;
    }
    
    this.extrasService.getExtras(this.houseSpecs.id).subscribe({
      next: (extras) => {
        if (extras && extras.length > 0) {
          const extrasData = extras[0];
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
                    scale: scale || DEFAULT_SCALES.door
                  };
                  
                  this.dragDrop3dService.addElement(elementData);
                }
              } catch (error) {
                console.error('Error adding door to 3D scene:', error, door);
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
                    scale: scale || DEFAULT_SCALES.window
                  };
                  
                  this.dragDrop3dService.addElement(elementData);
                }
              } catch (error) {
                console.error('Error adding window to 3D scene:', error, window);
              }
            });
          }
        } else {
          console.log('No extras found for this project');
        }
      },
      error: (error) => {
        console.log('No extras found or error loading 3D extras:', error);
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

  retry3DInitialization(): void {
    this.threeDInitialized = false;
    this.initializationAttempts = 0;
    this.error = '';
    
    if (this.houseSpecs) {
      setTimeout(() => {
        this.tryInitialize3D();
      }, 100);
    } else {
      this.loadPublicProject();
    }
  }

  forceInitialize3D(): void {
    if (this.threeDContainer?.nativeElement && this.houseSpecs && !this.loading && this.extrasLoaded) {
      this.init3DView();
    } else {
      console.error('Cannot force initialize - missing requirements');
    }
  }

  toggleLike(): void {
    if (!this.currentUserId || !this.publicProject) {
      this.error = 'Please log in to like projects';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    const originalLiked = this.publicProject.isLikedByCurrentUser;
    const originalLikes = this.publicProject.likes;

    this.publicProject.isLikedByCurrentUser = !this.publicProject.isLikedByCurrentUser;
    this.publicProject.likes += this.publicProject.isLikedByCurrentUser ? 1 : -1;

    this.publicProjectService.toggleLike(this.publicProject.id, this.currentUserId).subscribe({
      next: (result) => {
        this.publicProject!.isLikedByCurrentUser = result.isLiked;
        if (result.isLiked !== originalLiked) {
          this.publicProject!.likes = originalLikes + (result.isLiked ? 1 : -1);
        }
      },
      error: (error) => {
        this.publicProject!.isLikedByCurrentUser = originalLiked;
        this.publicProject!.likes = originalLikes;
        
        this.error = 'Failed to update like. Please try again.';
        setTimeout(() => this.error = '', 3000);
        console.error('Error toggling like:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/gallery']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  ngOnDestroy(): void {
    if (this.threeJsService.isInitialized()) {
      this.threeJsService.clearHouse();
    }
    if (this.dragDrop3dService) {
      this.dragDrop3dService.clearAll();
    }
  }
}