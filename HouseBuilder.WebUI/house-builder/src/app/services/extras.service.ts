import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Extras } from '../models/extras.model';
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {
  private apiURL = 'http://localhost:5042/api/v1/Extras';
  
  constructor(private http: HttpClient, private router: Router) { }

  create(extra: Extras): Observable<any> {
    const formattedData = this.formatExtrasForApi(extra);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.post<Extras>(this.apiURL, formattedData, { headers }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
  getById(id: string, houseSpecificationsId: string): Observable<Extras> {
    return this.http.get<Extras>(`${this.apiURL}/extras/${id}/specs/${houseSpecificationsId}`);
  }
  getExtras(houseSpecificationsId: string): Observable<Extras[]> {
    return this.http.get<Extras[]>(`${this.apiURL}/specs/${houseSpecificationsId}`);
  }

  update(id: string, extras: Extras): Observable<Extras | null> {
    const formattedData = this.formatExtrasForApi(extras);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.put<void>(`${this.apiURL}/${id}`, formattedData, { headers }).pipe(
      map(() => {
        return { ...extras, id };
      }),
      catchError(error => {
        console.error('ERROR UPDATING EXTRAS:', error);
        return throwError(() => error);
      })
    );
  }
  delete(id: string): Observable<void> {
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      map(() => undefined)
    );
  }
  cleanupDuplicateExtras(houseSpecificationsId: string): Observable<any> {
    return this.getExtras(houseSpecificationsId).pipe(
      switchMap(extras => {
        if (!extras || extras.length <= 1) {
          return of({ success: true, message: 'No duplicates found' });
        }
                
        const latestExtrasId = extras[0].id;
        const deleteObservables = extras
          .slice(1)
          .filter(extra => extra.id)
          .map(extra => this.delete(extra.id as string));
        
        if (deleteObservables.length === 0) {
          return of({ success: true, message: 'No valid duplicates to delete' });
        }
        
        return forkJoin(deleteObservables).pipe(
          map(() => ({ 
            success: true, 
            message: `Successfully deleted ${deleteObservables.length} duplicate records`,
            keepId: latestExtrasId
          })),
          catchError(error => {
            console.error('Error deleting duplicate extras:', error);
            return of({ 
              success: false, 
              message: 'Failed to delete some duplicates',
              error
            });
          })
        );
      })
    );
  }
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  private isValidGuid(str: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(str);
  }
  private formatExtrasForApi(extras: Extras): any {
    
    const formatted = {
      id: extras.id,
      houseSpecificationsId: extras.houseSpecificationsId,
      command: 'UpdateExtras', 
      doors: Array.isArray(extras.doors) ? extras.doors.map(door => {
        let doorId = door.id;
        if (!this.isValidGuid(doorId || '')) {
          doorId = this.generateGuid();
        }
        
        return {
          id: doorId,
          wall: door.wall,
          position: door.position,
          path: door.path,
          thumbnail: door.thumbnail || '',
          scale: door.scale ? {
            x: door.scale.x,
            y: door.scale.y,
            z: door.scale.z
          } : undefined
        };
      }) : [],
      windows: Array.isArray(extras.windows) ? extras.windows.map(window => {
        
        let windowId = window.id;
        if (!this.isValidGuid(windowId || '')) {
          windowId = this.generateGuid();
        }
        
        return {
          id: windowId,
          wall: window.wall,
          position: window.position,
          position2: window.position2 || 0.5,
          path: window.path,
          thumbnail: window.thumbnail || '',
          scale: window.scale ? {
            x: window.scale.x,
            y: window.scale.y,
            z: window.scale.z
          } : undefined
        };
      }) : []
    };
    return formatted;
  }
}