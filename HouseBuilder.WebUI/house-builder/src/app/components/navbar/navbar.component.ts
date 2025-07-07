import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class NavbarComponent implements OnInit {
  menuOpen: boolean = false;
  isLoggedIn: boolean = false;

  isSmallScreen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.checkScreenSize();
  }
  checkLoginStatus(): void {
    const token = sessionStorage.getItem('jwtToken');
    const userId = sessionStorage.getItem('userId');
    const role = sessionStorage.getItem('role');
    if (token && userId) {
      this.isLoggedIn = true;
    }
  }
  @HostListener('window:resize', [])
  checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth <= 768; 
      if (!this.isSmallScreen) {
        this.menuOpen = false; 
      }
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
  
  logout(): void {
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('role');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  redirectToDashboard(): void {
    this.router.navigate(['/client-profile/:id']);
  }
  redirectToHome() {
    this.router.navigate(['/']); 
  }

  redirectToGallery(): void {
    this.router.navigate(['/gallery']);
  }

  redirectToSuggestions(): void {
    this.router.navigate(['/gemini']);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}