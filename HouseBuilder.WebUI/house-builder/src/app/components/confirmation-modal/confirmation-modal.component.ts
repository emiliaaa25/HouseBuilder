import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="confirmation-overlay" (click)="onBackdropClick($event)">
      <div class="confirmation-container" (click)="$event.stopPropagation()">
        <div class="confirmation-header">
          <div class="confirmation-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
        
        <div class="confirmation-actions">
          <button class="btn btn-secondary" (click)="onCancel()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ cancelText }}
          </button>
          <button class="btn btn-danger" (click)="onConfirm()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(93, 58, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: 20px;
      font-family: 'Poppins', sans-serif;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirmation-container {
      background: white;
      border-radius: 20px;
      max-width: 480px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .confirmation-header {
      padding: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%);
      border-bottom: 1px solid #f0e8e0;
      position: relative;
    }

    .confirmation-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff6b6b, #e53e3e, #d32f2f);
      border-radius: 20px 20px 0 0;
    }

    .confirmation-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #fff5f5, #ffebee);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d32f2f;
      animation: iconPulse 0.6s ease-out;
    }

    @keyframes iconPulse {
      0% {
        transform: scale(0.8);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .confirmation-header h3 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #5D3A00;
    }

    .confirmation-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
      line-height: 1.5;
    }

    .confirmation-actions {
      display: flex;
      gap: 1rem;
      padding: 1.5rem 2rem 2rem;
      background: linear-gradient(135deg, #faf9f7 0%, #f5f3f0 100%);
    }

    .btn {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: 'Poppins', sans-serif;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #5D3A00;
      border: 2px solid #eae0d5;
    }

    .btn-secondary:hover {
      background: #f0f0f0;
      border-color: #d0c5b5;
      transform: translateY(-2px);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ff6b6b, #e53e3e);
      color: white;
      border: 2px solid transparent;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.25);
    }

    .btn-danger:hover {
      background: linear-gradient(135deg, #e53e3e, #d32f2f);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.35);
    }

    @media (max-width: 768px) {
      .confirmation-overlay {
        padding: 15px;
      }
      
      .confirmation-header {
        padding: 1.5rem;
      }
      
      .confirmation-actions {
        flex-direction: column;
        padding: 1.25rem;
      }
      
      .confirmation-icon {
        width: 60px;
        height: 60px;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Yes, Delete';
  @Input() cancelText = 'Cancel';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}