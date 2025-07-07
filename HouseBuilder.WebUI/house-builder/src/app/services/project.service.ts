import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Project } from '../models/project.model';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiURL ='http://localhost:5042/api/v1/Project';
  
  constructor(private http: HttpClient, private router: Router) { }

  getAllProjects(clientId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiURL}/client/${clientId}`);
  }

  getById(projectId: string, clientId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiURL}/project/${projectId}/client/${clientId}`);
  }


  //create
  createProject(project : Project) : Observable<any> {
    return this.http.post<Project>(this.apiURL, project);
  }

  

  update(id: string, project: Project): Observable<Project> {
    
    return this.http.put<Project>(`${this.apiURL}/${id}`, project);

  }
  

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      map(() => undefined) 
    );
  }
}
