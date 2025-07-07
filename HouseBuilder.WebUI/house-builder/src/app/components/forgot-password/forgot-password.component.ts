import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordResetService } from '../../services/password-reset.service';
import { EmailVerificationService } from '../../services/email-verification.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  linkSent: boolean = false;
  emailExists: boolean = true;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(
    private passwordResetService: PasswordResetService,
    private emailVerificationService: EmailVerificationService,
    private router: Router
  ) {}

  sendResetLink(): void {
    this.submitted = true;
    
    if (!this.email) {
      return;
    }
    
    this.isLoading = true;
    this.emailVerificationService.checkEmailExists(this.email).subscribe(
      (exists: boolean) => {
        console.log('Email exists:', exists);
        if (exists) {
          this.passwordResetService.sendResetLink(this.email).subscribe(
            (resetResponse: { success: boolean, message: string }) => {
              console.log('Password reset response:', resetResponse.message);
              if (resetResponse.success) {
                this.linkSent = true;
                this.emailExists = true;
                this.isLoading = false;
                this.linkSent = true;
                localStorage.setItem('resetEmail', this.email);
              } else {
                console.error('Error sending reset link:', resetResponse.message);
              }
            },
            error => {
              this.isLoading = false;
              this.emailExists = false;
              console.error('Error sending reset link', error);
            }
          );
        } else {
          this.emailExists = false;
        }
      },
      error => {
        console.error('Error checking email existence', error);
        this.emailExists = false;
      }
    );
  }
 
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
  dismissMessage(): void {
    this.linkSent = false;
    this.submitted = false;
    this.emailExists = true;
  }

  resetEmailExists(): void {
    this.emailExists = true;
  }
}