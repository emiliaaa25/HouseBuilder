import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicProjectService, CreatePublicProjectDto } from '../../services/public-project.service';
import { ThumbnailGeneratorService } from '../../services/thumbnail-generator.service';
import { ThreeJsService } from '../../services/three-js.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-publish-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './publish-project-modal.component.html',
  styleUrls: ['./publish-project-modal.component.css']
})
export class PublishProjectModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() project: Project | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() published = new EventEmitter<void>();

  publishData: CreatePublicProjectDto = {
    projectId: '',
    title: '',
    description: '',
    authorName: '',
    thumbnail: ''
  };

  isPublishing = false;
  error = '';
  success = false;
  
  generatingThumbnail = false;
  customThumbnail: File | null = null;
  thumbnailPreview = '';

  constructor(
    private publicProjectService: PublicProjectService,
    private thumbnailGenerator: ThumbnailGeneratorService,
    private threeJsService: ThreeJsService
  ) {}

ngOnInit(): void {  
  if (this.project) {
    this.publishData.projectId = this.project.id;
    this.publishData.title = this.project.address || 'My House Design';
    this.publishData.description = this.project.description || '';
    const firstName = sessionStorage.getItem('firstName') || '';
    const lastName = sessionStorage.getItem('lastName') || '';
    this.publishData.authorName = `${firstName} ${lastName}`.trim() || 'Anonymous';
    
  } else {
    console.error('No project data received!');
  }
}

  closeModal(): void {
    if (!this.isPublishing) {
      this.resetForm();
      this.close.emit();
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  generateThumbnail(): void {
    if (!this.threeJsService.scene || !this.threeJsService.renderer) {
      this.error = 'Unable to generate thumbnail. Please ensure the 3D view is loaded.';
      return;
    }

    this.generatingThumbnail = true;
    this.error = '';

    this.thumbnailGenerator.generateOptimalThumbnail(
      this.threeJsService.scene,
      this.threeJsService.renderer,
      400,
      300
    ).then(dataURL => {
      this.publishData.thumbnail = dataURL;
      this.thumbnailPreview = dataURL;
      this.generatingThumbnail = false;
    }).catch(error => {
      console.error('Error generating thumbnail:', error);
      this.error = 'Failed to generate thumbnail. Please try uploading a custom image.';
      this.generatingThumbnail = false;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.error = 'Please select a valid image file.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image file size must be less than 5MB.';
        return;
      }

      this.customThumbnail = file;
      this.error = '';
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.publishData.thumbnail = result;
        this.thumbnailPreview = result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeThumbnail(): void {
    this.publishData.thumbnail = '';
    this.thumbnailPreview = '';
    this.customThumbnail = null;
  }

publish(): void {
  if (!this.validateForm()) {
    return;
  }
  this.isPublishing = true;
  this.error = '';

  this.publicProjectService.publishProject(this.publishData).subscribe({
    next: (response) => {
      this.success = true;
      this.isPublishing = false;
      setTimeout(() => {
        this.published.emit();
        this.closeModal();
      }, 2000);
    },
    error: (error) => {
      console.error('Full error object:', error);
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Error details:', error.error);
      let errorMessage = 'Failed to publish project. Please try again.';
      
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.title) {
          errorMessage = error.error.title;
        } else if (error.error.errors) {
          const validationErrors = Object.values(error.error.errors).flat();
          errorMessage = validationErrors.join(', ');
        }
      }
      
      this.error = errorMessage;
      this.isPublishing = false;
    }
  });
}



  private validateForm(): boolean {
    if (!this.publishData.title?.trim()) {
      this.error = 'Please enter a title for your project.';
      return false;
    }

    if (!this.publishData.authorName?.trim()) {
      this.error = 'Please enter your name.';
      return false;
    }

    if (this.publishData.title.length > 200) {
      this.error = 'Title must be less than 200 characters.';
      return false;
    }

    if (this.publishData.description && this.publishData.description.length > 1000) {
      this.error = 'Description must be less than 1000 characters.';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.publishData = {
      projectId: '',
      title: '',
      description: '',
      authorName: '',
      thumbnail: ''
    };
    this.thumbnailPreview = '';
    this.customThumbnail = null;
    this.error = '';
    this.success = false;
    this.isPublishing = false;
    this.generatingThumbnail = false;
  }
}