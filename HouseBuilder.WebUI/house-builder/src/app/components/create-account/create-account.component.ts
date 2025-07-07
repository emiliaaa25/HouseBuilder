import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { DesignerService } from '../../services/designer.service';
import { VerificationStatus } from '../../models/designer.model';

@Component({
  selector: 'app-create-account',
  standalone: true,
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule]
})
export class CreateAccountComponent {
  registerForm: FormGroup;
  submitted: boolean = false;
  registrationSuccess: boolean = false;
  registrationError: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  profilePictureFile: File | null = null;
  certificateFile: File | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private fb: FormBuilder, private clientService: ClientService, private designerService: DesignerService) {
    this.registerForm = this.fb.group({
      pictureLink: [''], 
      username: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      isSpecialist: [false],
      professionalLicenseNumber: [''],
      yearsOfExperience: [''],
      specialization: [''],
      certificateFile: ['']
    }, {
      validators: this.passwordMatchValidator,
    });

    this.registerForm.get('isSpecialist')?.valueChanges.subscribe(isSpecialist => {
      const designerFields = ['professionalLicenseNumber', 'yearsOfExperience', 'specialization', 'certificateFile'];
      
      designerFields.forEach(field => {
        const control = this.registerForm.get(field);
        if (isSpecialist) {
          control?.setValidators([Validators.required]);
        } else {
          control?.clearValidators();
        }
        control?.updateValueAndValidity();
      });
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  dismissMessage(): void {
    this.registrationSuccess = false;
    this.registrationError = false;
  }

  redirectToLogin(): void {
    this.router.navigate(['login']);
  }

  onFileChange(event: Event, fileType: 'profile' | 'certificate'): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      if (fileType === 'profile') {
        this.profilePictureFile = inputElement.files[0];
        console.log('Profile picture selected:', this.profilePictureFile);
      } else {
        this.certificateFile = inputElement.files[0];
        console.log('Certificate selected:', this.certificateFile);
      }
    }
  }

  private registerDesigner(formData: any, pictureLink: string): void {
    const fileFormData = new FormData();
    if (this.certificateFile) {
      fileFormData.append('file', this.certificateFile);
    } else {
      console.error('No certificate file selected');
      this.isLoading = false;
      this.registrationError = true;
      this.errorMessage = 'Certificate file is required.';
      setTimeout(() => {
        this.registrationError = false;
      }, 5000);
      return;
    }
  
    this.designerService.uploadCertificate(fileFormData).subscribe({
      next: (response) => {
        console.log('Certificate uploaded successfully', response);
        const certificateFilePath = response.filePath;
  
        const designer = {
          pictureLink: pictureLink,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          passwordHash: formData.password, 
          professionalLicenseNumber: formData.professionalLicenseNumber,
          yearsOfExperience: formData.yearsOfExperience,
          specialization: formData.specialization,
          certificateFilePath: certificateFilePath,
          status: VerificationStatus.Pending,
          adminNotes: ''
        };
        console.log('Designer data to be sent:', designer);
  
        this.designerService.createDesigner(designer).subscribe({
          next: (response) => {
            console.log('Designer added to database', response);
            this.isLoading = false;
            this.registrationSuccess = true;
            setTimeout(() => {
              this.registrationSuccess = false;
              this.router.navigate(['/login']);
            }, 3000);
          },
          error: (error) => {
            console.error('Error adding designer to database', error);
            this.isLoading = false;
            this.registrationError = true;
            this.errorMessage = error.message || 'Registration failed. Please try again.';
            setTimeout(() => {
              this.registrationError = false;
            }, 5000);
          }
        });
      },
      error: (error) => {
        console.error('Error uploading certificate', error);
        this.isLoading = false;
        this.registrationError = true;
        this.errorMessage = 'Failed to upload certificate. Please try again.';
        setTimeout(() => {
          this.registrationError = false;
        }, 5000);
      }
    });
  }

  private registerClient(formData: any, pictureLink: string): void {
    const user = {
      pictureLink: pictureLink,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      passwordHash: formData.password 
    };
    console.log('User data to be sent:', user);
  
    this.clientService.createClient(user).subscribe({
      next: (response) => {
        console.log('User added to database', response);
        this.isLoading = false;
        this.registrationSuccess = true;
        setTimeout(() => {
          this.registrationSuccess = false;
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding user to database', error);
        this.isLoading = false;
        this.registrationError = true;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        setTimeout(() => {
          this.registrationError = false;
        }, 5000);
      }
    });
  }
  
  onRegister(): void {
    this.submitted = true;
    
    if (!this.registerForm.valid) {
      return;
    }
    
    if (!this.profilePictureFile) {
      this.registrationError = true;
      this.errorMessage = 'Profile picture is required.';
      setTimeout(() => {
        this.registrationError = false;
      }, 5000);
      return;
    }
    
    if (this.registerForm.get('isSpecialist')?.value && !this.certificateFile) {
      this.registrationError = true;
      this.errorMessage = 'Certificate file is required for specialists.';
      setTimeout(() => {
        this.registrationError = false;
      }, 5000);
      return;
    }
    
    this.isLoading = true;
    const formData = this.registerForm.value;
    const profilePictureFormData = new FormData();
    profilePictureFormData.append('file', this.profilePictureFile);
      
    this.designerService.uploadProfilePicture(profilePictureFormData).subscribe({
      next: (response) => {
        console.log('Profile picture uploaded successfully', response);
        const pictureLink = response.filePath;
  
        if (formData.isSpecialist) {
          this.registerDesigner(formData, pictureLink);
        } else {
          this.registerClient(formData, pictureLink);
        }
      },
      error: (error) => {
        console.error('Error uploading profile picture', error);
        this.isLoading = false;
        this.registrationError = true;
        this.errorMessage = 'Failed to upload profile picture. Please try again.';
        setTimeout(() => {
          this.registrationError = false;
        }, 5000);
      }
    });
  }
}