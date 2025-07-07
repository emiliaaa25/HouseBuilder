import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { Designer } from '../../models/designer.model';
import { Admin } from '../../models/admin.model';
import { Client } from '../../models/client.model';
import { VerificationStatus } from '../../models/designer.model';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { DesignerService } from '../../services/designer.service';
import { AdminService } from '../../services/admin.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { SafePipe } from '../../pipes/safe.pipe';
import { CertificateModel } from '../../models/certificate.model';

export enum ProjectStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    NavbarComponent,
    SafePipe
  ],
})
export class ClientProfileComponent implements OnInit {

  currentUser: User | Designer | Admin | Client;
  activeTab = 'personal';
  isSpecialist = false;
  isClient = false;
  isAdmin = false;
  loading = true;
  errorMessage = '';
  verificationStatusEnum = VerificationStatus;
  projects: Project[] = [];
  showCreateForm: boolean = false;
  newProject: Project = this.initializeNewProject();
  showDeleteConfirmation: boolean = false;
  deletePassword: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';
  userId: string = '';
  updateSuccess: boolean = false;
  deleteSuccess: boolean = false;
  passwordChangeSuccess: boolean = false;
  projectCreatedSuccess: boolean = false;
  certificateValidationSuccess: boolean = false;
  originalUserData: any = null;
  designers: Designer[] = [];
  filteredDesigners: Designer[] = [];
  certificateStatus: string = 'all';
  validationForm: FormGroup;
  selectedDesigner: Designer | null = null;
  isModalOpen: boolean = false;
  certificatesLoading: boolean = false;
  
  selectedFile: File | null = null;
  projectStatus = ProjectStatus; 

  constructor(
    private clientService: ClientService,
    private designerService: DesignerService,
    private adminService: AdminService,
    private projectService: ProjectService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.currentUser = {} as User;
    this.validationForm = this.fb.group({
      adminNotes: ['', Validators.maxLength(500)],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.fetchUserData();
    this.loadProjects();
    const userRole = sessionStorage.getItem('role');
    if (userRole === 'Admin' && this.activeTab === 'certificates') {
      this.loadDesignerCertificates();
    }
  }

  initializeNewProject(): Project {
    return {
      id: '',
      constructorId: '',
      address: '',
      description: '',
      status: ProjectStatus.Pending,
      createdAt: '',
      updatedAt: '',
    } as Project;
  }
  
  loadProjects(): void {
    this.loading = true;

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'User ID is missing';
      this.loading = false;
      return;
    }
    this.projectService.getAllProjects(userId).subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects. Please try again.';
        this.loading = false;
      }
    });
  }
  
  updatePassword(): void {
    if (!this.currentPassword) {
      this.errorMessage = 'Current password is required';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match';
      return;
    }
    

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }
    
    const token = sessionStorage.getItem('jwtToken');
    const userId = sessionStorage.getItem('userId');
  
    if (this.isSpecialist && userId && token) {

      const command = {
        designerId: userId,
        currentPassword : this.currentPassword,
        password: this.newPassword
      };
  
      this.designerService.updatePassword(userId, command, token).subscribe({
        next: () => {
          console.log('Password updated successfully for designer');
          this.passwordChangeSuccess = true;
          this.resetPasswordFields();
          setTimeout(() => {
            this.passwordChangeSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating password for designer:', error);
          this.errorMessage = 'Failed to update password. Please check your current password.';
        }
      });
    } else {
      if (!userId || !token) {
        this.errorMessage = 'User ID or token is missing';
        return;
      }

      const command = {
        clientId: userId,
        currentPassword : this.currentPassword,
        password: this.newPassword
      };
  
      this.clientService.updatePassword(userId, command, token).subscribe({
        next: () => {
          console.log('Password updated successfully for client');
          this.passwordChangeSuccess = true;
          this.resetPasswordFields();
          setTimeout(() => {
            this.passwordChangeSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating password for client:', error);
          this.errorMessage = 'Failed to update password. Please check your current password.';
        }
      });
    }
  }
  
  resetPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
  
  hashPassword(password: string): string {
    return btoa(password); 
  }

  deleteAccount(): void {
    if (!this.deletePassword) {
      this.errorMessage = 'Please enter your password to confirm account deletion';
      return;
    }
    
    const token = sessionStorage.getItem('jwtToken');
    const userId = sessionStorage.getItem('userId');
    const userType = sessionStorage.getItem('role');
    
    if (!userId || !token) {
      this.errorMessage = 'Authentication failed. Please log in again.';
      return;
    }
    
    this.loading = true;
    
    if (userType === 'Client') {
      this.clientService.delete(userId, token).subscribe({
        next: () => {
          this.loading = false;
          this.deleteSuccess = true;
          this.clearSessionData();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Error deleting account: ' + (error.message || 'Unknown error');
        }
      });
    } else if (userType === 'Specialist') {
      this.designerService.delete(userId, token).subscribe({
        next: () => {
          this.loading = false;
          this.deleteSuccess = true;          
          this.clearSessionData();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Error deleting account: ' + (error.message || 'Unknown error');
        }
      });
    }
  }
  
  clearSessionData(): void {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    localStorage.removeItem('token');
  }
  
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newProject = this.initializeNewProject();
    }
  }
  
  cancelCreateProject(): void {
    this.showCreateForm = false;
  }
  
  saveNewProject(): void {
    if (!this.newProject.address || !this.newProject.description) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('jwtToken');
    
    if (!userId) {
      this.errorMessage = 'User ID is missing';
      return;
    }
    
    this.newProject.constructorId = userId;
    console.log('Sending project data:', JSON.stringify(this.newProject));
    
    this.loading = true;
    this.projectService.createProject(this.newProject).subscribe({
      next: (response) => {
        console.log('Project created successfully:', response);
        this.showCreateForm = false;
        this.loading = false;
        this.projectCreatedSuccess = true;
        setTimeout(() => {
          this.projectCreatedSuccess = false;
        }, 3000);
        setTimeout(() => {
          this.loadProjects();
        }, 500);
      },
      error: (error) => {
        console.error('Server error details:', error);
        this.errorMessage = `Failed to create project: ${error.error?.message || error.message || 'Unknown server error'}`;
        this.loading = false;
      }
    });
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
  
  getProjectStatusText(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Pending: return 'Pending';
      case ProjectStatus.InProgress: return 'In Progress';
      case ProjectStatus.Completed: return 'Completed';
      default: return 'Unknown';
    }
  }
  
  isImage(filePath: string): boolean {
    if (!filePath) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const urlWithoutParams = filePath.split('?')[0];
    const extension = urlWithoutParams.split('.').pop()?.toLowerCase();
    const result = imageExtensions.includes('.' + extension);
    return result;
  }
  
  isPDF(filePath: string): boolean {
    return filePath?.toLowerCase().endsWith('.pdf') || false;
  }
  
  getProjectStatusClass(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.Pending: return 'status-pending';
      case ProjectStatus.InProgress: return 'status-in-progress';
      case ProjectStatus.Completed: return 'status-completed';
      default: return '';
    }
  }

  fetchUserData(): void {
    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    const userType = sessionStorage.getItem('role');
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      this.errorMessage = 'Authentication token missing';
      this.loading = false;
      return;
    }
    
    if (!userId) {
      this.errorMessage = 'User not authenticated';
      this.loading = false;
      return;
    }
    if (userType === 'Specialist') {
      this.isSpecialist = true;
      this.designerService.getById(userId).subscribe({
        next: (designer) => {
          this.currentUser = designer;
          this.originalUserData = JSON.parse(JSON.stringify(designer));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching designer data:', error);
          this.errorMessage = 'Failed to load designer profile';
          this.loading = false;
        }
      });
    } else if (userType === 'Client') {
      this.isClient = true;
      this.clientService.getById(userId).subscribe({
        next: (client) => {
          this.currentUser = client;
          this.originalUserData = JSON.parse(JSON.stringify(client));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching client data:', error);
          this.errorMessage = 'Failed to load client profile';
          this.loading = false;
        }
      });
    } else if (userType === 'Admin') {
      this.isAdmin = true;
      this.loading = false;
    } else {
      this.errorMessage = 'Unknown user type';
      this.loading = false;
    }
  }
  
  loadDesignerCertificates(): void {
    this.certificatesLoading = true;
    const token = sessionStorage.getItem('jwtToken');
    const filterResult = this.applyCertificateFilter();
  
    if (!token) {
      this.errorMessage = 'Authentication token missing';
      this.certificatesLoading = false;
      return;
    }
  
    this.adminService.getDesignerCertificates(token, filterResult).subscribe({
      next: (data) => {
        console.log('Certificate designers:', data);
        this.designers = data || [];
        this.filteredDesigners = data || []; 
        this.applyCertificateFilter();
        this.certificatesLoading = false;
      },
      error: (err) => {
        console.error('Error loading certificates:', err);
        this.errorMessage = 'Failed to load certificates: ' + (err.message || 'Unknown error');
        this.certificatesLoading = false;
      }
    });
  }
  
  applyCertificateFilter(): number | undefined {
    if (this.certificateStatus === 'all') {
      this.filteredDesigners = [...this.designers];
      return undefined;
    } else {
      console.log('Filtering by status:', this.certificateStatus);
      const statusEnum = VerificationStatus[this.certificateStatus as keyof typeof VerificationStatus];
      console.log('Status enum:', statusEnum);
  
      this.filteredDesigners = this.designers.filter(designer => designer.status === statusEnum);
      return statusEnum;
    }
  }
  
  openValidationModal(designer: Designer): void {
    this.selectedDesigner = designer;
    this.validationForm.patchValue({
      adminNotes: designer.adminNotes || '',
      status: designer.status
    });
    this.isModalOpen = true;
  }
  
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDesigner = null;
  }
  
  getStatusString(status: number): string {
    return VerificationStatus[status];
  }
  
  submitValidation(): void {
    if (!this.selectedDesigner || !this.validationForm.valid) {
      return;
    }
    
    const token = sessionStorage.getItem('jwtToken');
    
    if (token) {
      const command: CertificateModel = {
        designerId: this.selectedDesigner.id,
        newStatus: parseInt(this.validationForm.value.status), 
        adminNotes: this.validationForm.value.adminNotes
      };
      
      console.log('Validation command:', command);
      
      this.certificatesLoading = true;
      this.adminService.validateDesignerCertificate(this.selectedDesigner.id, command, token).subscribe({
        next: (response) => {
          console.log('API response:', response);
          this.designers = [];
          this.filteredDesigners = [];
          this.certificateValidationSuccess = true;
          this.loadDesignerCertificates();
          this.closeModal();
          setTimeout(() => {
            this.certificateValidationSuccess = false;
          }, 3000);
          
          console.log('Certificate validated successfully!');
        },
        error: (err) => {
          console.error('Error validating certificate:', err);
          this.errorMessage = 'Failed to validate certificate';
          this.certificatesLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Authentication token missing';
    }
  }

  getStatus(): VerificationStatus {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).status;
    }
    return VerificationStatus.Pending; 
  }
  
  getLicense(): string {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).professionalLicenseNumber || '';
    }
    return '';
  }

  getExperience(): number {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).yearsOfExperience || 0;
    }
    return 0;
  }

  getSpecialization(): string {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).specialization || '';
    }
    return '';
  }

  getCertificatePath(): string {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).certificateFilePath || '';
    }
    return '';
  }
  
  getAdminNotes(): string {
    if (this.isSpecialist) {
      return (this.currentUser as Designer).adminNotes || '';
    }
    return '';
  }
  
  selectTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'certificates' && this.isAdmin) {
      this.loadDesignerCertificates();
    }
  }
  
  getStatusClass(status: VerificationStatus): string {
    switch (status) {
      case VerificationStatus.Pending:
        return 'status-pending';
      case VerificationStatus.Approved:
        return 'status-approved';
      case VerificationStatus.Rejected:
        return 'status-rejected';
      case VerificationStatus.AdditionalInfoRequested:
        return 'status-info';
      default:
        return '';
    }
  }
  
  getStatusText(status: VerificationStatus): string {
    return VerificationStatus[status];
  }
  
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      console.log('Selected new certificate file:', this.selectedFile.name);
      this.uploadCertificate();
    }
  }
  
  uploadCertificate(): void {
    if (this.selectedFile && this.isSpecialist) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      if (this.currentUser.id) {
        formData.append('designerId', this.currentUser.id);
        this.loading = true;
        this.designerService.uploadCertificate(formData).subscribe({
          next: (response) => {
            console.log('Certificate uploaded successfully:', response);
            (this.currentUser as Designer).certificateFilePath = response.filePath;
            (this.currentUser as Designer).status = VerificationStatus.Pending;
            (this.currentUser as Designer).adminNotes = '';
            this.saveChanges();
            (this.currentUser as Designer).status = VerificationStatus.Pending;
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error uploading certificate:', error);
            this.errorMessage = 'Failed to upload certificate';
            this.loading = false;
          }
        });
      } else {
        console.error('Designer ID is undefined');
        return;
      }
    }
  }

  dismissMessage(): void {
    this.errorMessage = '';
    this.updateSuccess = false;
    this.passwordChangeSuccess = false;
    this.projectCreatedSuccess = false;
    this.certificateValidationSuccess = false;
  }
  
  resetChanges(): void {
    if (this.originalUserData) {
      this.currentUser = JSON.parse(JSON.stringify(this.originalUserData));
    }
  }
  
  saveChanges(): void {
    this.loading = true;
  
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      this.errorMessage = 'Authentication token missing';
      this.loading = false;
      return;
    }
    if (this.isSpecialist) {
      if (!this.currentUser.id) {
        console.error('Error: currentUser.id is undefined');
        this.errorMessage = 'Failed to update profile due to missing user ID';
        this.loading = false;
        return;
      }

      console.log('Updating designer profile:', this.currentUser);
      
      this.designerService.update(this.currentUser.id, this.currentUser as Designer, token).subscribe({
        next: () => {
          console.log('Designer profile updated successfully');
          this.updateSuccess = true; 
          this.originalUserData = JSON.parse(JSON.stringify(this.currentUser));
          setTimeout(() => {
            this.updateSuccess = false;
          }, 3000);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating designer profile:', error);
          this.errorMessage = 'Failed to update profile';
          
          this.loading = false;
        }
      });
    } else if (this.isClient) {
      if (!this.currentUser.id) {
        console.error('Error: currentUser.id is undefined');
        this.errorMessage = 'Failed to update profile due to missing user ID';
        this.loading = false;
        return;
      }
      
      this.clientService.update(this.currentUser.id, this.currentUser as Client, token).subscribe({
        next: () => {
          console.log('Client profile updated successfully');
          this.updateSuccess = true; 
          this.originalUserData = JSON.parse(JSON.stringify(this.currentUser));
          setTimeout(() => {
            this.updateSuccess = false;
          }, 3000);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating client profile:', error);
          this.errorMessage = 'Failed to update profile';
          this.loading = false;
        }
      });
    } else {
      if (!this.currentUser.id) {
        console.error('Error: currentUser.id is undefined');
        this.errorMessage = 'Failed to update profile due to missing user ID';
        this.loading = false;
        return;
      }
      
      this.adminService.update(this.currentUser.id, this.currentUser as Admin, token).subscribe({
        next: () => {
          console.log('Admin profile updated successfully');
          this.updateSuccess = true;
          this.originalUserData = JSON.parse(JSON.stringify(this.currentUser));
          setTimeout(() => {
            this.updateSuccess = false;
          }, 3000);
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating admin profile:', error);
          this.errorMessage = 'Failed to update profile';
          this.loading = false;
        }
      });
    }
  }
}