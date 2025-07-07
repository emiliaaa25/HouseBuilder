import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  isLoading = false;
  loginSuccess = false;
  loginError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {}
  dismissMessage(): void {
    this.loginSuccess = false;
    this.loginError = false;
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    if (this.loginForm.valid) {
      this.loginService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.loginSuccess = true;  
          sessionStorage.setItem('jwtToken', response.token);
          sessionStorage.setItem('userId', response.id);
          sessionStorage.setItem('role', response.role);
          
          setTimeout(() => {
            this.loginSuccess = false;
           
            if (response.role === 'Admin') {
              this.router.navigate([`/client-profile/${response.id}`]);
            } else if (response.role === 'Specialist') {
              this.router.navigate([`/client-profile/${response.id}`]);
            } else if (response.role === 'Client') {
              this.router.navigate([`/client-profile/${response.id}`]);
            }
          }, 2000);
        },
        error: (error: any) => {
          console.error('Login failed', error);
          this.isLoading = false;
          this.loginError = true; 
          this.errorMessage = 'Invalid email or password. Please try again.';
          setTimeout(() => {
            this.loginError = false;
          }, 5000);
        }
      });
    }
  }

  redirectToRegister(): void {
    this.router.navigate(['register']); 
  }

  redirectToForgotPassword(): void {
    this.router.navigate(['forgot-password']); 
  }
}