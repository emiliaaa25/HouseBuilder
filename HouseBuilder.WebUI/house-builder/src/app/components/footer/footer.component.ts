import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule]
})
export class FooterComponent {
  
  isTermsModalOpen = false;
  isPrivacyModalOpen = false;
  isHelpModalOpen = false;
  isContactModalOpen = false;
  isAboutModalOpen = false;
  showSuccessMessage = false;
  successTitle = '';
  successMessage = '';

  constructor() { }

  openTermsModal(): void {
    this.closeAllModals();
    this.isTermsModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeTermsModal(): void {
    this.isTermsModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  acceptTerms(): void {
    localStorage.setItem('termsAccepted', 'true');
    this.showNotification('Terms Accepted!', 'Thank you for accepting our Terms and Conditions!');
    this.closeTermsModal();
  }

  declineTerms(): void {
    this.showNotification('Terms Required', 'You must accept the Terms and Conditions to use our service.');
    this.closeTermsModal();
  }

  openPrivacyModal(): void {
    this.closeAllModals();
    this.isPrivacyModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closePrivacyModal(): void {
    this.isPrivacyModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  acceptPrivacy(): void {
    localStorage.setItem('privacyAccepted', 'true');
    this.showNotification('Privacy Policy Accepted!', 'Thank you for reading our Privacy Policy!');
    this.closePrivacyModal();
  }

  openHelpModal(): void {
    this.closeAllModals();
    this.isHelpModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeHelpModal(): void {
    this.isHelpModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  openContactModal(): void {
    this.closeAllModals();
    this.isContactModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeContactModal(): void {
    this.isContactModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  openAboutModal(): void {
    this.closeAllModals();
    this.isAboutModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeAboutModal(): void {
    this.isAboutModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  closeAllModals(): void {
    this.isTermsModalOpen = false;
    this.isPrivacyModalOpen = false;
    this.isHelpModalOpen = false;
    this.isContactModalOpen = false;
    this.isAboutModalOpen = false;
  }

  showNotification(title: string, message: string): void {
    this.successTitle = title;
    this.successMessage = message;
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.dismissMessage();
    }, 4000);
  }

  dismissMessage(): void {
    this.showSuccessMessage = false;
  }

  onModalOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeAllModals();
      document.body.style.overflow = 'auto';
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllModals();
      document.body.style.overflow = 'auto';
    }
  }
}