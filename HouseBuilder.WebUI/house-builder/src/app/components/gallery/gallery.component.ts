import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicProjectService, PublicProjectDto, GalleryFilters } from '../../services/public-project.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { HouseSpecificationsService } from '../../services/houseSpecifications.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  projects: PublicProjectDto[] = [];
  loading = false;
  error = '';
  currentUserId: string = '';
  filters: GalleryFilters = {
    page: 1,
    pageSize: 12,
    sortBy: 'newest'
  };
  
  hasMore = true;
  loadingMore = false;
  sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'most_liked', label: 'Most Liked' },
    { value: 'most_viewed', label: 'Most Viewed' }
  ];

  constructor(
    private publicProjectService: PublicProjectService,
    private router: Router,
    private houseSpecsService: HouseSpecificationsService 
  ) {}

  ngOnInit(): void {
    this.currentUserId = sessionStorage.getItem('userId') || '';
    this.filters.userId = this.currentUserId;
    this.loadProjects();
  }

  loadProjects(reset: boolean = true): void {
    if (reset) {
      this.filters.page = 1;
      this.projects = [];
      this.hasMore = true;
    }

    this.loading = reset;
    this.loadingMore = !reset;

    this.publicProjectService.getPublicProjects(this.filters).subscribe({
      next: (newProjects) => {
        if (reset) {
          this.projects = newProjects;
        } else {
          this.projects = [...this.projects, ...newProjects];
        }
        this.hasMore = newProjects.length === this.filters.pageSize;
        
        this.loading = false;
        this.loadingMore = false;
        this.error = '';
      },
      error: (error) => {
        this.error = 'Failed to load projects. Please try again.';
        this.loading = false;
        this.loadingMore = false;
        console.error('Error loading projects:', error);
      }
    });
  }

  onSortChange(): void {
    this.loadProjects(true);
  }

  loadMore(): void {
    if (this.hasMore && !this.loadingMore) {
      this.filters.page = (this.filters.page || 1) + 1;
      this.loadProjects(false);
    }
  }

  toggleLike(project: PublicProjectDto): void {
    if (!this.currentUserId) {
      this.error = 'Please log in to like projects';
      setTimeout(() => this.error = '', 3000);
      return;
    }

    const originalLiked = project.isLikedByCurrentUser;
    const originalLikes = project.likes;
    project.isLikedByCurrentUser = !project.isLikedByCurrentUser;
    project.likes += project.isLikedByCurrentUser ? 1 : -1;

    this.publicProjectService.toggleLike(project.id, this.currentUserId).subscribe({
      next: (result) => {
        project.isLikedByCurrentUser = result.isLiked;
        if (result.isLiked !== originalLiked) {
          project.likes = originalLikes + (result.isLiked ? 1 : -1);
        }
      },
      error: (error) => {
        project.isLikedByCurrentUser = originalLiked;
        project.likes = originalLikes;
        this.error = 'Failed to update like. Please try again.';
        setTimeout(() => this.error = '', 3000);
        console.error('Error toggling like:', error);
      }
    });
  }
viewProject(project: PublicProjectDto): void {
  this.publicProjectService.getPublicProject(project.id, this.currentUserId).subscribe({
    next: (updatedProject) => {
      const projectIndex = this.projects.findIndex(p => p.id === project.id);
      if (projectIndex !== -1) {
        this.projects[projectIndex].views = updatedProject.views;
      }
      this.router.navigate(['/gallery/view', project.id]);
    },
    error: (error) => {
      console.error('Error recording view:', error);
      this.router.navigate(['/gallery/view', project.id]);
    }
  });
}

private loadHouseSpecsForProject(projectId: string): Promise<string | null> {
  return new Promise((resolve) => {
    this.houseSpecsService.getHouseSpecifications(projectId).subscribe({
      next: (specs) => {
        if (specs && specs.length > 0) {
          resolve(specs[0].id || null);
        } else {
          resolve(null);
        }
      },
      error: (error) => {
        console.error('Error loading house specs:', error);
        resolve(null);
      }
    });
  });
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
}
