import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { HouseSpecifications, RoofType, HouseShapeType } from '../../models/houseSpecifications.model';
import { HouseSpecificationsService } from '../../services/houseSpecifications.service';
import { ProjectStatus } from '../client-profile/client-profile.component';
import { NavbarComponent } from "../navbar/navbar.component";
import { MaterialSpecification, MaterialType } from '../../models/materialSpecification.model';
import { MaterialSelectorComponent } from '../material-selector/material-selector.component';
import { ClientService } from '../../services/client.service';
import { DesignerService } from '../../services/designer.service';
import { PublicProjectService } from '../../services/public-project.service';
import { PublishProjectModalComponent } from '../publish-project-modal/publish-project-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  imports: [CommonModule, FormsModule, NavbarComponent, MaterialSelectorComponent, PublishProjectModalComponent, ConfirmationModalComponent],
  standalone: true
})
export class ProjectDetailsComponent implements OnInit {
  projectId: string = '';
  project: Project | null = null;
  originalProject: Project | null = null;
  useWallTexture: boolean = false;
  useRoofTexture: boolean = false;
  useFloorTexture: boolean = false;
  useCustomWallMaterials: boolean = false;
  selectedWallPosition: string = 'MainFront';
  customWallMaterials: { position: string, material: MaterialSpecification }[] = [];
  showPublishModal: boolean = false;
isProjectPublic: boolean = false;
checkingPublicStatus: boolean = false;
showDeleteConfirmation: boolean = false;
  showRemoveFromGalleryConfirmation: boolean = false;
  houseSpecs: HouseSpecifications | null = null;
  originalHouseSpecs: HouseSpecifications | null = null;
  houseSpecsId: string = '';
  houseSpecsExist: boolean = false;
  isSpecialist = false;
 status = 0;
  loading = {
    project: false,
    houseSpecs: false
  };
  editMode = {
    project: false,
    houseSpecs: false
  };
  error = {
    project: '',
    houseSpecs: ''
  };
  updateSuccess: boolean = false;
  errorMessage: string = '';
  projectDeletedSuccess: boolean = false;
  specsUpdatedSuccess: boolean = false;
  userId: string = '';
  ProjectStatus = ProjectStatus;
  HouseShapeType = HouseShapeType;
  RoofType = RoofType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private houseSpecsService: HouseSpecificationsService,
    private designerService: DesignerService,
    private publicProjectService: PublicProjectService 

  ) {}
ngOnInit(): void {
  this.userId = sessionStorage.getItem('userId') || '';
  this.isSpecialist = sessionStorage.getItem('role') === 'Specialist';
  
  this.route.params.subscribe(params => {
    this.projectId = params['id'];
    this.isProjectPublic = false;
    this.checkingPublicStatus = false;
    
    this.loadProject();
    this.loadHouseSpecifications();
    this.loadUserData();
  });
}

  ensureFloorsArray(): boolean {
    if (!this.houseSpecs) {
      return false;
    }
    this.houseSpecs.numFloors = Math.max(1, this.houseSpecs.numFloors || 1);
    if (!this.houseSpecs.floors) {
      this.updateFloorsArray();
    } else if (this.houseSpecs.floors.length !== this.houseSpecs.numFloors) {
      this.updateFloorsArray();
    }
    
    return true;
  }
  loadHouseSpecifications(): void {
  this.loading.houseSpecs = true;
  this.houseSpecsService.getHouseSpecifications(this.projectId).subscribe({
    next: (specs) => {
      if (specs && specs.length > 0) {
        this.houseSpecs = specs[0];
        this.houseSpecsId = this.houseSpecs?.id || '';
        if (this.houseSpecs.shapeParameters) {
          this.extractShapeParameters(this.houseSpecs);
        }
        
        this.initializeDefaultMaterials();
        this.ensureFloorsArray();
        
        this.originalHouseSpecs = JSON.parse(JSON.stringify(this.houseSpecs));
        this.houseSpecsExist = true;
        this.checkIfProjectIsPublic();
        
      } else {
        this.initializeEmptyHouseSpecs();
        this.houseSpecsExist = false;
      }
      this.loading.houseSpecs = false;
    },
    error: (error) => {
      if (error.status === 404) {
        this.initializeEmptyHouseSpecs();
        this.houseSpecsExist = false;
      } else {
        this.error.houseSpecs = 'Eroare la încărcarea specificațiilor. Eroare server.';
        console.error('Eroare server la încărcarea specificațiilor:', error);
      }
      this.loading.houseSpecs = false;
    }
  });
}

  loadProject(): void {
  this.loading.project = true;
  
  this.projectService.getById(this.projectId, this.userId).subscribe({
    next: (data) => {        
      if (data) {
        this.project = data;
        this.originalProject = {...data};
        if (this.houseSpecsId) {
          this.checkIfProjectIsPublic();
        }
      } else {
        this.error.project = 'No project data found.';
      }
      this.loading.project = false;
    },
    error: (error) => {
      this.error.project = 'Failed to load project details. Please try again.';
      this.loading.project = false;
      console.error('Error loading project:', error);
    }
  });
}

  redirectToGallery(): void {
    this.router.navigate(['/gallery']);
  }


  toggleProjectEditMode(): void {
    this.editMode.project = !this.editMode.project;
    
    if (!this.editMode.project && this.originalProject) {
      this.project = {...this.originalProject};
    }
  }
  
  cancelEditProject(): void {
    if (this.originalProject) {
      this.project = {...this.originalProject};
    }
    this.editMode.project = false;
  }

  saveProject(): void {
    if (!this.project) return;
    
    this.loading.project = true;
    const projectToSave = {...this.project};
    if (!projectToSave.constructorId) {
      projectToSave.constructorId = this.userId;
    }
    if (typeof projectToSave.createdAt === 'string') {
      projectToSave.createdAt = new Date(projectToSave.createdAt).toISOString();
    }
    projectToSave.updatedAt = new Date().toISOString();    
    this.projectService.update(this.projectId, projectToSave).subscribe({
      next: (updatedProject) => {
        if (updatedProject) {
          this.project = updatedProject;
          this.originalProject = {...updatedProject};
        } else {
          console.warn('Received empty project data from server, using local copy');
          this.project = projectToSave;
          this.originalProject = {...projectToSave};
        }
        this.updateSuccess = true;
        setTimeout(() => {
          this.updateSuccess = false;
        }, 3000);
        this.editMode.project = false;
        this.loading.project = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to update project details. Please try again.';
        this.loading.project = false;
        console.error('Error updating project:', error);
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
deleteProject(): void {
  this.showDeleteConfirmation = true;
}

onConfirmDelete(): void {
  this.showDeleteConfirmation = false;
  this.loading.project = true;
  if (this.houseSpecsId) {
    this.houseSpecsService.delete(this.houseSpecsId).subscribe({
      next: () => {
        this.deleteProjectOnly();
      },
      error: (error) => {
        console.error('Error deleting house specifications:', error);
        this.deleteProjectOnly();
      }
    });
  } else {
    this.deleteProjectOnly();
  }
}

onCancelDelete(): void {
  this.showDeleteConfirmation = false;
}
  
  deleteProjectOnly(): void {
    this.projectService.delete(this.projectId).subscribe({
      next: () => {
        this.projectDeletedSuccess = true;
        setTimeout(() => {
          this.projectDeletedSuccess = false;
          this.navigateToProjectList();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete project. Please try again.';
        this.loading.project = false;
        console.error('Error deleting project:', error);
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  
  extractShapeParameters(houseSpecs: HouseSpecifications): void {
    const params = houseSpecs.shapeParameters || {};
    if (params['Length'] !== undefined) houseSpecs['length'] = params['Length'];
    if (params['Width'] !== undefined) houseSpecs['width'] = params['Width'];
    
    if (params['Size'] !== undefined) houseSpecs['size'] = params['Size'];
    
    if (params['MainLength'] !== undefined) houseSpecs['mainLength'] = params['MainLength'];
    if (params['MainWidth'] !== undefined) houseSpecs['mainWidth'] = params['MainWidth'];
    if (params['ExtensionLength'] !== undefined) houseSpecs['extensionLength'] = params['ExtensionLength'];
    if (params['ExtensionWidth'] !== undefined) houseSpecs['extensionWidth'] = params['ExtensionWidth'];
    
    if (params['CrossLength'] !== undefined) houseSpecs['crossLength'] = params['CrossLength'];
    if (params['CrossWidth'] !== undefined) houseSpecs['crossWidth'] = params['CrossWidth'];
    
    if (params['BaseLength'] !== undefined) houseSpecs['baseLength'] = params['BaseLength'];
    if (params['BaseWidth'] !== undefined) houseSpecs['baseWidth'] = params['BaseWidth'];
    if (params['LeftWingLength'] !== undefined) houseSpecs['leftWingLength'] = params['LeftWingLength'];
    if (params['LeftWingWidth'] !== undefined) houseSpecs['leftWingWidth'] = params['LeftWingWidth'];
    if (params['RightWingLength'] !== undefined) houseSpecs['rightWingLength'] = params['RightWingLength'];
    if (params['RightWingWidth'] !== undefined) houseSpecs['rightWingWidth'] = params['RightWingWidth'];
  }
  
  initializeEmptyHouseSpecs(): void {
    this.houseSpecs = {
      projectId: this.projectId,
      roofType: RoofType.Flat,
      shapeType: HouseShapeType.Rectangular,
      wallMaterial: {
        type: MaterialType.Brick,
        color: '#c4a38e',
        texturePath: ''
      },
      roofMaterial: {
        type: MaterialType.MetalRoof,
        color: '#913a1c',
        texturePath: ''
      },
      floorMaterial: {
        type: MaterialType.Wood,
        color: '#b78b52',
        texturePath: ''
      },
      materialCustomizations: '{}' ,
      numFloors: 1,
      floors: [],
        };
  }
  
  toggleHouseSpecsEditMode(): void {
    this.editMode.houseSpecs = !this.editMode.houseSpecs;
    
    if (!this.editMode.houseSpecs && this.originalHouseSpecs) {
      this.houseSpecs = JSON.parse(JSON.stringify(this.originalHouseSpecs));
    }
  }
  
  cancelEditSpecs(): void {
    if (this.originalHouseSpecs) {
      this.houseSpecs = JSON.parse(JSON.stringify(this.originalHouseSpecs));
    }
   
    this.editMode.houseSpecs = false;

  }
  
  addHouseSpecifications(): void {
    this.initializeEmptyHouseSpecs();
    this.houseSpecsExist = true;
    this.editMode.houseSpecs = true;
  }
  
  onShapeTypeChange(): void {
    if (!this.houseSpecs) return;
    
    const resetProps = [
      'length', 'width', 'size', 
      'mainLength', 'mainWidth', 'extensionLength', 'extensionWidth',
      'crossLength', 'crossWidth',  
      'baseLength', 'baseWidth', 'leftWingLength', 'leftWingWidth', 'rightWingLength', 'rightWingWidth'
    ];
    
    resetProps.forEach(prop => {
      if (prop in this.houseSpecs!) {
        delete (this.houseSpecs as any)[prop];
      }
    });
    
    this.houseSpecs.roofType = RoofType.Flat;
    switch (this.houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        (this.houseSpecs as any)['length'] = 0;
        (this.houseSpecs as any)['width'] = 0;
        break;
      case HouseShapeType.Square:
        (this.houseSpecs as any)['size'] = 0;
        break;
      case HouseShapeType.LShape:
        (this.houseSpecs as any)['mainLength'] = 0;
        (this.houseSpecs as any)['mainWidth'] = 0;
        (this.houseSpecs as any)['extensionLength'] = 0;
        (this.houseSpecs as any)['extensionWidth'] = 0;
        break;
      case HouseShapeType.TShape:
        (this.houseSpecs as any)['mainLength'] = 0;
        (this.houseSpecs as any)['mainWidth'] = 0;
        (this.houseSpecs as any)['crossLength'] = 0;
        (this.houseSpecs as any)['crossWidth'] = 0;
        break;
      case HouseShapeType.UShape:
        (this.houseSpecs as any)['baseLength'] = 0;
        (this.houseSpecs as any)['baseWidth'] = 0;
        (this.houseSpecs as any)['leftWingLength'] = 0;
        (this.houseSpecs as any)['leftWingWidth'] = 0;
        (this.houseSpecs as any)['rightWingLength'] = 0;
        (this.houseSpecs as any)['rightWingWidth'] = 0;
        break;
    }
  }
  
  saveHouseSpecifications(): void {
    if (!this.houseSpecs) return;
    
    this.loading.houseSpecs = true;
  this.houseSpecs.numFloors = this.houseSpecs.numFloors || 1;
  this.updateFloorsArray();
  
  if (this.houseSpecs.floors && this.houseSpecs.floors.length > 0) {
    const invalidFloors = this.houseSpecs.floors.filter(floor => {
      const height = floor.floorHeigth || 0;
      return height <= 0 || height > 5;
    });
    
    if (invalidFloors.length > 0) {
      this.errorMessage = 'Floor heights must be between 0.1 and 5 meters.';
      this.loading.houseSpecs = false;
      return;
    }
  }
  let floorsForBackend: any[] = [];
  if (this.houseSpecs.floors && this.houseSpecs.floors.length > 0) {
    floorsForBackend = this.houseSpecs.floors.map(floor => {
      return {
        "Index": floor.index || 0,
        "FloorHeigth": floor.floorHeigth || 3.0
      };
    });
  } else if (this.houseSpecs.numFloors > 0) {
    for (let i = 0; i < this.houseSpecs.numFloors; i++) {
      floorsForBackend.push({
        "Index": i,
        "FloorHeigth": i === 0 ? 3.0 : 2.8
      });
    }
  }
    const specsToSave: any = {
      id: this.houseSpecsId, 
      projectId: this.projectId,
      roofType: this.houseSpecs.roofType,
      shapeType: this.houseSpecs.shapeType,
      wallMaterial: {
        type: this.houseSpecs.wallMaterial.type,
        color: this.houseSpecs.wallMaterial.color,
        texturePath: this.houseSpecs.wallMaterial.texturePath
      },
      roofMaterial: 
      {
        type: this.houseSpecs.roofMaterial.type,
        color: this.houseSpecs.roofMaterial.color,
        texturePath: this.houseSpecs.roofMaterial.texturePath
      },
      floorMaterial: {
        type: this.houseSpecs.floorMaterial.type,
        color: this.houseSpecs.floorMaterial.color,
        texturePath: this.houseSpecs.floorMaterial.texturePath
      },
      materialCustomizations: this.houseSpecs.materialCustomizations || '{}',
      numFloors: this.houseSpecs.numFloors,
      floors: floorsForBackend, 
    };

    switch (this.houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        specsToSave.length = (this.houseSpecs as any).length || 0;
        specsToSave.width = (this.houseSpecs as any).width || 0;
        break;
      case HouseShapeType.Square:
        specsToSave.size = (this.houseSpecs as any).size || 0;
        break;
      case HouseShapeType.LShape:
        specsToSave.mainLength = (this.houseSpecs as any).mainLength || 0;
        specsToSave.mainWidth = (this.houseSpecs as any).mainWidth || 0;
        specsToSave.extensionLength = (this.houseSpecs as any).extensionLength || 0;
        specsToSave.extensionWidth = (this.houseSpecs as any).extensionWidth || 0;
        break;
      case HouseShapeType.TShape:
        specsToSave.mainLength = (this.houseSpecs as any).mainLength || 0;
        specsToSave.mainWidth = (this.houseSpecs as any).mainWidth || 0;
        specsToSave.crossLength = (this.houseSpecs as any).crossLength || 0;
        specsToSave.crossWidth = (this.houseSpecs as any).crossWidth || 0;
        break;
      case HouseShapeType.UShape:
        specsToSave.baseLength = (this.houseSpecs as any).baseLength || 0;
        specsToSave.baseWidth = (this.houseSpecs as any).baseWidth || 0;
        specsToSave.leftWingLength = (this.houseSpecs as any).leftWingLength || 0;
        specsToSave.leftWingWidth = (this.houseSpecs as any).leftWingWidth || 0;
        specsToSave.rightWingLength = (this.houseSpecs as any).rightWingLength || 0;
        specsToSave.rightWingWidth = (this.houseSpecs as any).rightWingWidth || 0;
        break;
    }
    if (this.houseSpecsId) {
      this.houseSpecsService.update(this.houseSpecsId, specsToSave).subscribe({
        next: (updatedSpecs) => {
          this.handleHouseSpecsSaveSuccess(updatedSpecs, specsToSave);
        },
        error: (error) => {
          this.handleHouseSpecsSaveError(error);
        }
      });
    } else {
      this.houseSpecsService.createHouseSpecifications(specsToSave).subscribe({
        next: (createdSpecs) => {
          if (createdSpecs && !createdSpecs.id) {
            console.warn('Server response missing ID field:', createdSpecs);
          }
          this.handleHouseSpecsSaveSuccess(createdSpecs, specsToSave);
        },
        error: (error) => {
          this.handleHouseSpecsSaveError(error);
        }
      });
    }
  }
  
  private handleHouseSpecsSaveSuccess(serverResponse: any, localData: any): void {
    if (serverResponse && serverResponse.id) {
      this.houseSpecs = {
        ...serverResponse,
        wallMaterial: {
          type: serverResponse.wallMaterial.type || localData.wallMaterial.type,
          color: serverResponse.wallMaterial.color || localData.wallMaterial.color,
          texturePath: serverResponse.wallMaterial.texturePath || localData.wallMaterial.texturePath},
        roofMaterial: {
          type: serverResponse.roofMaterial.type || localData.roofMaterial.type,
          color: serverResponse.roofMaterial.color || localData.roofMaterial.color,
          texturePath: serverResponse.roofMaterial.texturePath || localData.roofMaterial.texturePath},
        floorMaterial:
        {
          type: serverResponse.floorMaterial.type || localData.floorMaterial.type,
          color: serverResponse.floorMaterial.color || localData.floorMaterial.color,
          texturePath: serverResponse.floorMaterial.texturePath || localData.floorMaterial.texturePath
        },
        materialCustomizations: serverResponse.materialCustomizations || localData.materialCustomizations
    };
          this.houseSpecsId = serverResponse.id;
      
      if (serverResponse.shapeParameters) {
        if (this.houseSpecs) {
          this.extractShapeParameters(this.houseSpecs);
        }
      }
    } else {
      this.houseSpecs = {...localData};
      this.houseSpecsId = this.houseSpecsId || '';
    }
    
    this.originalHouseSpecs = JSON.parse(JSON.stringify(this.houseSpecs));
    this.editMode.houseSpecs = false;
    this.loading.houseSpecs = false;
    this.houseSpecsExist = true;
    this.error.houseSpecs = '';
    this.specsUpdatedSuccess = true;
    setTimeout(() => {
      this.specsUpdatedSuccess = false;
    }, 3000);
  }

  private handleHouseSpecsSaveError(error: any): void {
    const operation = this.houseSpecsId ? 'update' : 'create';
    this.errorMessage = `Failed to ${operation} house specifications.`;
    this.loading.houseSpecs = false;
    console.error(`Error ${operation}ing house specifications:`, error);
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
  
  dismissMessage(): void {
    this.updateSuccess = false;
    this.errorMessage = '';
    this.projectDeletedSuccess = false;
    this.specsUpdatedSuccess = false;
  }
  
  viewIn3D(): void {
    if (this.projectId) {
      if (this.houseSpecsId) {
        this.router.navigate([`/3d-view/${this.houseSpecsId}/${this.projectId}`]);
      } else {
        this.errorMessage = 'Nu puteți vizualiza modelul 3D fără specificații pentru casă. Vă rugăm să adăugați specificații mai întâi.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    }
  }
  
  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
  
  formatDateTime(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleString();
  }
  
  getRoofTypeName(type: RoofType): string {
    const labels = {
      [RoofType.Gable]: 'Gable',
      [RoofType.Hip]: 'Hip',
      [RoofType.Mansard]: 'Mansard',
      [RoofType.Flat]: 'Flat',
      [RoofType.Shed]: 'Shed',
      [RoofType.Pyramid]: 'Pyramid',
      [RoofType.Dome]: 'Dome',
      [RoofType.Cross_gabled]: 'Cross Gabled',
      [RoofType.Intersecting_hip]: 'Intersecting Hip',
      [RoofType.Gable_roof_with_extension]: 'Gable Roof with Extension',
      [RoofType.Hip_roof_with_extension]: 'Hip Roof with Extension',
      [RoofType.Cross_gabled_T_configuration]: 'Cross Gabled T Configuration',
      [RoofType.Multiple_valley]: 'Multiple Valley',
      [RoofType.Multiple_gable]: 'Multiple Gable',
      [RoofType.Courtyard]: 'Courtyard',
      [RoofType.Complex_hip_and_valley]: 'Complex Hip and Valley',
      [RoofType.Connected_section]: 'Connected Section',
      [RoofType.Partial_flat_roof_with_hipped_wings]: 'Partial Flat Roof with Hipped Wings'
    };
    return labels[type] || 'Unknown';
  }
  
  getShapeTypeName(type: HouseShapeType | undefined): string {
    if (type === undefined) return 'Unknown';
    
    const labels = {
      [HouseShapeType.Rectangular]: 'Rectangular',
      [HouseShapeType.Square]: 'Square',
      [HouseShapeType.LShape]: 'L-Shape',
      [HouseShapeType.TShape]: 'T-Shape',
      [HouseShapeType.UShape]: 'U-Shape'
    };
    return labels[type] || 'Unknown';
  }
  navigateToProjectList(): void {
    this.router.navigate([`/client-profile/${this.userId}`], { 
      queryParams: { tab: 'projects' } 
    });
  }
  
  goBack(): void {
    this.navigateToProjectList();
  }
  getStatusOptions(): {value: ProjectStatus, label: string}[] {
    return [
      { value: ProjectStatus.Pending, label: 'Pending' },
      { value: ProjectStatus.InProgress, label: 'In Progress' },
      { value: ProjectStatus.Completed, label: 'Completed' }
    ];
  }
  
  getRoofTypeOptions(): {value: RoofType, label: string}[] {
    const baseOptions = [
      { value: RoofType.Flat, label: 'Flat' }
    ];
    
    if (!this.houseSpecs) {
      return baseOptions;
    }
    
    switch (this.houseSpecs.shapeType) {
      case HouseShapeType.Rectangular:
        return [
          ...baseOptions,
          { value: RoofType.Gable, label: 'Gable' },
          { value: RoofType.Hip, label: 'Hip' },
        ];
      case HouseShapeType.Square:
        return [
          ...baseOptions,
          { value: RoofType.Pyramid, label: 'Pyramid' },
          { value: RoofType.Gable, label: 'Gable' }
        ];
      case HouseShapeType.LShape:
        return [
          ...baseOptions,
          { value: RoofType.Cross_gabled, label: 'Gable' },
          { value: RoofType.Hip, label: 'Hip' },
    
        ];
      case HouseShapeType.TShape:
        return [
          ...baseOptions,
          {value: RoofType.Gable, label: 'Gable' },
          { value: RoofType.Hip, label: 'Hip' },
        
        ];
      case HouseShapeType.UShape:
        return [
          ...baseOptions,
          { value: RoofType.Gable, label: 'Gable' },
          { value: RoofType.Hip, label: 'Hip' },
        ];
      default:
        return [
          { value: RoofType.Gable, label: 'Gable' },
          { value: RoofType.Hip, label: 'Hip' },
          { value: RoofType.Mansard, label: 'Mansard' },
          { value: RoofType.Flat, label: 'Flat' },
          { value: RoofType.Shed, label: 'Shed' },
          { value: RoofType.Pyramid, label: 'Pyramid' },
          { value: RoofType.Dome, label: 'Dome' },
          { value: RoofType.Cross_gabled, label: 'Cross Gabled' },
          { value: RoofType.Intersecting_hip, label: 'Intersecting Hip' },
          { value: RoofType.Gable_roof_with_extension, label: 'Gable Roof with Extension' },
          { value: RoofType.Hip_roof_with_extension, label: 'Hip Roof with Extension' },
          { value: RoofType.Cross_gabled_T_configuration, label: 'Cross Gabled T Configuration' },
          { value: RoofType.Multiple_valley, label: 'Multiple Valley' },
          { value: RoofType.Multiple_gable, label: 'Multiple Gable' },
          { value: RoofType.Courtyard, label: 'Courtyard' },
          { value: RoofType.Complex_hip_and_valley, label: 'Complex Hip and Valley' },
          { value: RoofType.Connected_section, label: 'Connected Section' },
          { value: RoofType.Partial_flat_roof_with_hipped_wings, label: 'Partial Flat Roof with Hipped Wings' }
        ];
    }
  }

  loadUserData(): void {
    if(this.isSpecialist ) {
    this.designerService.getById(this.userId).subscribe({
      next: (data) => {
        if (data) {
          this.status = data.status;
        } else {
          console.error('No user data found.');
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });}
  }
  
  
  getShapeTypeOptions(): {value: HouseShapeType, label: string, imagePath: string}[] {
      const allOptions = [
        { value: HouseShapeType.Rectangular, label: 'Rectangular', imagePath: 'assets/images/rectangular-house.png' },
        { value: HouseShapeType.Square, label: 'Square', imagePath: 'assets/images/square-house.png' },
        { value: HouseShapeType.LShape, label: 'L-Shape', imagePath: 'assets/images/l-shape-house.png' },
        { value: HouseShapeType.TShape, label: 'T-Shape', imagePath: 'assets/images/t-shape-house.png' },
        { value: HouseShapeType.UShape, label: 'U-Shape', imagePath: 'assets/images/u-shape-house.png', specialistOnly: true, status:1 }
      ];
    
      return allOptions.filter(option => {
        if (option.specialistOnly) {
          return this.isSpecialist, this.status === 1;

        }
        return true;
      });
    }
    
  
  selectShapeType(shapeType: HouseShapeType): void {
    console.log('Shape button clicked:', shapeType);
    
    if (!this.houseSpecs) {
      this.houseSpecs = {
        projectId: this.projectId,
        roofType: RoofType.Flat,
        shapeType: HouseShapeType.Rectangular,
        wallMaterial: {
          type: MaterialType.Brick,
          color: '#c4a38e',
          texturePath: ''
        },
        roofMaterial: {
          type: MaterialType.MetalRoof,
          color: '#913a1c',
          texturePath: ''
        },
        floorMaterial: {
          type: MaterialType.Wood,
          color: '#b78b52',
          texturePath: ''
        },
        materialCustomizations: '{}',
        numFloors: 1,
        floors: [],
      };
    }
    
    this.houseSpecs.shapeType = shapeType;
    
    this.initializeShapeParameters(shapeType);
  }
  

  updateFloorsArray(): void {
    if (!this.houseSpecs) {
      return;
    }
    this.houseSpecs.numFloors = Math.max(1, parseInt(this.houseSpecs.numFloors as any) || 1);
    
    if (!this.houseSpecs.floors) {
      this.houseSpecs.floors = [];
    }
    
    const currentLength = this.houseSpecs.floors.length;
    
    if (this.houseSpecs.numFloors > currentLength) {
      for (let i = currentLength; i < this.houseSpecs.numFloors; i++) {
        const defaultHeight = i === 0 ? 3.0 : 2.8;
        
        const newFloor = {
          index: i,
          floorHeigth: defaultHeight
        };
        
        this.houseSpecs.floors.push(newFloor);
      }
    } else if (this.houseSpecs.numFloors < currentLength) {
      this.houseSpecs.floors.splice(this.houseSpecs.numFloors, currentLength - this.houseSpecs.numFloors);
    }
    for (let i = 0; i < this.houseSpecs.floors.length; i++) {
      const floor = this.houseSpecs.floors[i];
      floor.index = i;
      floor.floorHeigth = parseFloat(floor.floorHeigth as any) || (i === 0 ? 3.0 : 2.8);
    }
  }

  initializeShapeParameters(shapeType: HouseShapeType): void {
    if (!this.houseSpecs) return;
    const resetProps = [
      'length', 'width', 'size', 
      'mainLength', 'mainWidth', 'extensionLength', 'extensionWidth',
      'crossLength', 'crossWidth',  
      'baseLength', 'baseWidth', 'leftWingLength', 'leftWingWidth', 'rightWingLength', 'rightWingWidth'
    ];
    resetProps.forEach(prop => {
      if (prop in this.houseSpecs!) {
        delete (this.houseSpecs as any)[prop];
      }
    });
    this.houseSpecs.roofType = RoofType.Flat;
  
    switch (shapeType) {
      case HouseShapeType.Rectangular:
        (this.houseSpecs as any)['length'] = 10;
        (this.houseSpecs as any)['width'] = 8;
        break;
      case HouseShapeType.Square:
        (this.houseSpecs as any)['size'] = 10;
        break;
      case HouseShapeType.LShape:
        (this.houseSpecs as any)['mainLength'] = 10;
        (this.houseSpecs as any)['mainWidth'] = 8;
        (this.houseSpecs as any)['extensionLength'] = 6;
        (this.houseSpecs as any)['extensionWidth'] = 4;
        break;
      case HouseShapeType.TShape:
        (this.houseSpecs as any)['mainLength'] = 10;
        (this.houseSpecs as any)['mainWidth'] = 8;
        (this.houseSpecs as any)['crossLength'] = 8;
        (this.houseSpecs as any)['crossWidth'] = 4;
        break;
      case HouseShapeType.UShape:
        (this.houseSpecs as any)['baseLength'] = 10;
        (this.houseSpecs as any)['baseWidth'] = 4;
        (this.houseSpecs as any)['leftWingLength'] = 6;
        (this.houseSpecs as any)['leftWingWidth'] = 4;
        (this.houseSpecs as any)['rightWingLength'] = 6;
        (this.houseSpecs as any)['rightWingWidth'] = 4;
        break;
    }
  }
  getSelectedShapeImagePath(): string {
    if (!this.houseSpecs || this.houseSpecs.shapeType === undefined) return '';
    
    const selectedOption = this.getShapeTypeOptions().find(option => option.value === this.houseSpecs?.shapeType);
    return selectedOption ? selectedOption.imagePath : '';
  }
  getStatusDisplayText(status: ProjectStatus | undefined): string {
    if (status === undefined) return '';
    
    switch (status) {
      case ProjectStatus.Pending:
        return 'Pending';
      case ProjectStatus.InProgress:
        return 'In Progress';
      case ProjectStatus.Completed:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }
initializeDefaultMaterials(): void {
  if (!this.houseSpecs) return;
  
  console.log('Materiale înainte de inițializare:', JSON.stringify({
    wallMaterial: this.houseSpecs.wallMaterial,
    roofMaterial: this.houseSpecs.roofMaterial,
    floorMaterial: this.houseSpecs.floorMaterial
  }));
  if (!this.houseSpecs.wallMaterial) {
    this.houseSpecs.wallMaterial = {
      type: MaterialType.Brick,
      color: '#c4a38e',
      texturePath: ''
    };
  } else {
    if (this.houseSpecs.wallMaterial.type === undefined) {
      this.houseSpecs.wallMaterial.type = MaterialType.Brick;
    }
    if (!this.houseSpecs.wallMaterial.color) {
      this.houseSpecs.wallMaterial.color = '#c4a38e';
    }
    if (this.houseSpecs.wallMaterial.texturePath === undefined) {
      this.houseSpecs.wallMaterial.texturePath = '';
    }
  }
  if (!this.houseSpecs.roofMaterial) {
    this.houseSpecs.roofMaterial = {
      type: MaterialType.MetalRoof,
      color: '#913a1c',
      texturePath: ''
    };
  } else {
    if (this.houseSpecs.roofMaterial.type === undefined) {
      this.houseSpecs.roofMaterial.type = MaterialType.MetalRoof;
    }
    if (!this.houseSpecs.roofMaterial.color) {
      this.houseSpecs.roofMaterial.color = '#913a1c';
    }
    if (this.houseSpecs.roofMaterial.texturePath === undefined) {
      this.houseSpecs.roofMaterial.texturePath = '';
    }
  }
  
  if (!this.houseSpecs.floorMaterial) {
    this.houseSpecs.floorMaterial = {
      type: MaterialType.Wood,
      color: '#b78b52',
      texturePath: ''
    };
  } else {
    if (this.houseSpecs.floorMaterial.type === undefined) {
      this.houseSpecs.floorMaterial.type = MaterialType.Wood;
    }
    if (!this.houseSpecs.floorMaterial.color) {
      this.houseSpecs.floorMaterial.color = '#b78b52';
    }
    if (this.houseSpecs.floorMaterial.texturePath === undefined) {
      this.houseSpecs.floorMaterial.texturePath = '';
    }
  }
  if (this.houseSpecs.materialCustomizations) {
    try {
      const customizations = JSON.parse(this.houseSpecs.materialCustomizations);
      this.customWallMaterials = [];
      
      for (const [position, material] of Object.entries(customizations)) {
        this.customWallMaterials.push({
          position: position,
          material: material as MaterialSpecification
        });
      }
      this.useCustomWallMaterials = this.customWallMaterials.length > 0;
    } catch (e) {
      console.error('Error parsing material customizations:', e);
      this.customWallMaterials = [];
    }
  } else {
    this.customWallMaterials = [];
  }
  
  this.useWallTexture = !!this.houseSpecs.wallMaterial.texturePath;
  this.useRoofTexture = !!this.houseSpecs.roofMaterial.texturePath;
  this.useFloorTexture = !!this.houseSpecs.floorMaterial.texturePath;
}

getMaterialTypeName(type: MaterialType | undefined): string {
  if (type === undefined) return 'Unknown';
  
  const materialTypes = [
   { value: MaterialType.Brick, name: 'Brick' },
    { value: MaterialType.Stone, name: 'Stone' },
    { value: MaterialType.Concrete, name: 'Concrete' },
    { value: MaterialType.Stucco, name: 'Stucco' },
    { value: MaterialType.Wood, name: 'Wood' },
    { value: MaterialType.Vinyl, name: 'Vinyl' },
    { value: MaterialType.Metal, name: 'Metal' },
    { value: MaterialType.Tile, name: 'Tile' },
    { value: MaterialType.MetalRoof, name: 'Metal Roof' },
    { value: MaterialType.Composite, name: 'Composite' },
  
  ];
  
  const found = materialTypes.find(mt => mt.value === type);
  return found ? found.name : 'Unknown';
}

getMaterialTypes() {
  return [
    { value: MaterialType.Brick, name: 'Brick' },
    { value: MaterialType.Stone, name: 'Stone' },
    { value: MaterialType.Concrete, name: 'Concrete' },
    { value: MaterialType.Stucco, name: 'Stucco' },
    { value: MaterialType.Wood, name: 'Wood' },
    { value: MaterialType.Vinyl, name: 'Vinyl' },
    { value: MaterialType.Metal, name: 'Metal' },
    { value: MaterialType.Tile, name: 'Tile' },
    { value: MaterialType.MetalRoof, name: 'Metal Roof' },
    { value: MaterialType.Composite, name: 'Composite' },
  ];
}

updateMaterialDefaults(materialType: string): void {
  if (!this.houseSpecs) return;
  
  const defaultColors: { [key: number]: string } = {
    [MaterialType.Brick]: '#a33c2c',
    [MaterialType.Stone]: '#989898',
    [MaterialType.Concrete]: '#c0c0c0',
    [MaterialType.Stucco]: '#f0e4d4',
    [MaterialType.Wood]: '#b68e68',
    [MaterialType.Vinyl]: '#e2e2e2',
    [MaterialType.Metal]: '#b1b5b8',
    [MaterialType.Tile]: '#dd9f93',
    [MaterialType.MetalRoof]: '#7a8d8f',
    [MaterialType.Composite]: '#d3d3d3'
  };
  
  if (materialType === 'wall' && this.houseSpecs.wallMaterial) {
    if (!this.useWallTexture) {
      this.houseSpecs.wallMaterial.texturePath = '';
    }
    const type = this.houseSpecs.wallMaterial.type;
    this.houseSpecs.wallMaterial.color = defaultColors[type];
  }
  else if (materialType === 'roof' && this.houseSpecs.roofMaterial) {
    if (!this.useRoofTexture) {
      this.houseSpecs.roofMaterial.texturePath = '';
    }
    const type = this.houseSpecs.roofMaterial.type;
    this.houseSpecs.roofMaterial.color = defaultColors[type];
  }
  else if (materialType === 'floor' && this.houseSpecs.floorMaterial) {
    if (!this.useFloorTexture) {
      this.houseSpecs.floorMaterial.texturePath = '';
    }
    const type = this.houseSpecs.floorMaterial.type;
    this.houseSpecs.floorMaterial.color = defaultColors[type];
  }
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
checkIfProjectIsPublic(): void {
  if (!this.projectId) {
    console.warn('No project ID available for public status check');
    return;
  }
  
  if (!this.houseSpecsId) {
    console.warn('No house specs ID available - project cannot be public');
    this.isProjectPublic = false;
    return;
  }
  
  this.checkingPublicStatus = true;  
  this.publicProjectService.isProjectPublic(this.projectId).subscribe({
    next: (isPublic) => {
      this.isProjectPublic = Boolean(isPublic); 
      this.checkingPublicStatus = false;
      setTimeout(() => {
        console.log('After timeout - isProjectPublic:', this.isProjectPublic);
      }, 100);
    },
    error: (error) => {
      console.error('Error checking public status:', error);
      this.isProjectPublic = false;
      this.checkingPublicStatus = false;
    }
  });
}
openPublishModal(): void {
  if (!this.project) {
    this.errorMessage = 'Project data is required to publish.';
    return;
  }
  
  if (!this.houseSpecsId) {
    this.errorMessage = 'House specifications are required to publish. Please add specifications first.';
    return;
  }
  
  this.showPublishModal = true;
}

closePublishModal(): void {
  this.showPublishModal = false;
}

onProjectPublished(): void {
  this.isProjectPublic = true;
  this.showPublishModal = false;
  this.updateSuccess = true;
  setTimeout(() => {
    this.updateSuccess = false;
  }, 3000);
}
removeFromGallery(): void {
  this.showRemoveFromGalleryConfirmation = true;
}

onConfirmRemoveFromGallery(): void {
  this.showRemoveFromGalleryConfirmation = false;
  
  if (!this.projectId || !this.userId) return;
  
  this.publicProjectService.removeFromGallery(this.projectId, this.userId).subscribe({
    next: () => {
      this.isProjectPublic = false;
      this.updateSuccess = true;
      setTimeout(() => {
        this.updateSuccess = false;
      }, 3000);
    },
    error: (error) => {
      this.errorMessage = 'Failed to remove project from gallery. Please try again.';
      console.error('Error removing from gallery:', error);
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  });
}

onCancelRemoveFromGallery(): void {
  this.showRemoveFromGalleryConfirmation = false;
}
hasCustomWallMaterial(position: string): boolean {
  return this.customWallMaterials.some(item => item.position === position);
}

getOrCreateCustomWallMaterial(position: string): { position: string, material: MaterialSpecification } | null {
  if (!this.houseSpecs) return null;
  
  const existingMaterial = this.customWallMaterials.find(item => item.position === position);
  
  if (existingMaterial) {
    return existingMaterial;
  } else {
    const newMaterial: MaterialSpecification = {
      type: this.houseSpecs.wallMaterial.type,
      color: this.houseSpecs.wallMaterial.color,
      texturePath: this.houseSpecs.wallMaterial.texturePath || ''
    };
    return {
      position: position,
      material: newMaterial
    };
  }
}

updateCustomWallMaterial(position: string, material: MaterialSpecification): void {
  if (!this.houseSpecs) return;
  const existingIndex = this.customWallMaterials.findIndex(item => item.position === position);
  
  if (existingIndex >= 0) {
    this.customWallMaterials[existingIndex].material = { ...material };
  } else {
    this.customWallMaterials.push({
      position: position,
      material: { ...material }
    });
  }
  this.updateMaterialCustomizationsString();
}

removeCustomWallMaterial(position: string): void {
  const index = this.customWallMaterials.findIndex(item => item.position === position);
  
  if (index >= 0) {
    this.customWallMaterials.splice(index, 1);
    this.updateMaterialCustomizationsString();
  }
}
updateMaterialCustomizationsString(): void {
  if (!this.houseSpecs) return;
  const customizationsObj: { [key: string]: MaterialSpecification } = {};
  
  this.customWallMaterials.forEach(item => {
    customizationsObj[item.position] = item.material;
  });
  this.houseSpecs.materialCustomizations = this.customWallMaterials.length > 0 
    ? JSON.stringify(customizationsObj) 
    : '';
}
getWallPositionName(position: string): string {
  const positionMap: { [key: string]: string } = {
    'MainFront': 'Front',
    'MainBack': 'Back',
    'MainLeft': 'Left',
    'MainRight': 'Right',
    'ExtensionFront': 'Extension Front',
    'ExtensionBack': 'Extension Back',
    'ExtensionLeft': 'Extension Left',
    'ExtensionRight': 'Extension Right',
    'CrossFront': 'Cross Front',
    'CrossBack': 'Cross Back',
    'LeftWingFront': 'Left Wing Front',
    'LeftWingBack': 'Left Wing Back',
    'LeftWingLeft': 'Left Wing Left',
    'RightWingFront': 'Right Wing Front',
    'RightWingBack': 'Right Wing Back',
    'RightWingRight': 'Right Wing Right'
  };
  
  return positionMap[position] || position;
}

getCustomWallMaterial(position: string): MaterialSpecification | undefined {
  const customMaterial = this.customWallMaterials.find(m => m.position === position);
  return customMaterial?.material;
}

onWallMaterialChange(material: MaterialSpecification): void {
  if (this.houseSpecs) {
    this.houseSpecs.wallMaterial = {
      type: material.type,
      color: material.color,
      texturePath: material.texturePath
    };
  }
}

onRoofMaterialChange(material: MaterialSpecification): void {
  if (this.houseSpecs) {
    this.houseSpecs.roofMaterial = {
      type: material.type,
      color: material.color,
      texturePath: material.texturePath
    };
  }
}

onFloorMaterialChange(material: MaterialSpecification): void {
  if (this.houseSpecs) {
    this.houseSpecs.floorMaterial = {
      type: material.type,
      color: material.color,
      texturePath: material.texturePath
    };
  }
}



getTextureNameFromPath(path: string): string {
  if (!path) return 'None';
  const parts = path.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
}
isTransparent(color: string): boolean {
  if (!color) return false;
  return color.toLowerCase() === 'transparent' || 
         color.toLowerCase() === '#00000000' || 
         (color.startsWith('#') && color.length === 9 && color.endsWith('00'));
}
}