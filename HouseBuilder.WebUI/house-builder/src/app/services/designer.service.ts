import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Designer } from '../models/designer.model';


@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  private apiURL ='http://localhost:5042/api/v1/Designer';
  private apiURL2 ='http://localhost:5042/api/v1/Files';
  
  constructor(private http: HttpClient, private router: Router) { }

  getDesigners() : Observable<Designer[]> {
    return this.http.get<Designer[]>(this.apiURL);
  }

  //create
  createDesigner(designer : Designer) : Observable<any> {
    return this.http.post<Designer>(this.apiURL, designer);
  }

  uploadCertificate(file: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiURL2}/upload-certificate`, file);
  }
  uploadProfilePicture(file: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiURL2}/upload-profile`, file);
  }
  getById(id: string): Observable<Designer> {
    return this.http.get<Designer>(`${this.apiURL}/${id}`);
  }
  updatePassword(id: string, command: { designerId: string; password: string }, token: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put<void>(`${this.apiURL}/${id}/update-password`, command, { headers });
  }
 
  update(id: string, client: Designer, token: string): Observable<Designer> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.put<Designer>(`${this.apiURL}/${id}`, client, { headers });
  }

  delete(id: string, token: string): Observable<void> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiURL}/${id}`, { headers }).pipe(
      map(() => undefined) 
    );
  }
  

}
