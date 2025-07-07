import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

export interface PublicProjectDto {
  id: string;
  projectId: string;
  thumbnail?: string;
  views: number;
  likes: number;
  authorName?: string;
  title?: string;
  description?: string;
  publishedAt: string;
  isLikedByCurrentUser: boolean;
}

export interface CreatePublicProjectDto {
  projectId: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  authorName?: string;
}

export interface GalleryFilters {
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'popular' | 'most_liked' | 'most_viewed';
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicProjectService {
  private apiURL ='http://localhost:5042/api/v1/PublicProject';

  constructor(private http: HttpClient) {}

  getPublicProjects(filters: GalleryFilters = {}): Observable<PublicProjectDto[]> {
    let params = new HttpParams();
    
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);

    return this.http.get<PublicProjectDto[]>(this.apiURL, { params });
  }

  getPublicProject(id: string, userId?: string): Observable<PublicProjectDto> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);

    return this.http.get<PublicProjectDto>(`${this.apiURL}/${id}`, { params });
  }

  publishProject(data: CreatePublicProjectDto): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiURL, data);
  }

  toggleLike(publicProjectId: string, userId: string): Observable<{ isLiked: boolean }> {
    return this.http.post<{ isLiked: boolean }>(`${this.apiURL}/${publicProjectId}/like`, { userId });
  }

  removeFromGallery(projectId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/project/${projectId}/user/${userId}`);
  }


isProjectPublic(projectId: string): Observable<boolean> {
  
  return this.http.get<boolean>(`${this.apiURL}/check/${projectId}`).pipe(
    tap(response => {
     
    }),
    catchError(error => {
      
      return of(false); 
    })
  );
}
}