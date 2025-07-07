import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HouseSpecifications } from '../models/houseSpecifications.model';


@Injectable({
  providedIn: 'root'
})
export class HouseSpecificationsService {

  private apiURL ='http://localhost:5042/api/v1/HouseSpecifications';
  
  constructor(private http: HttpClient, private router: Router) { }

  getHouseSpecifications(projectId: string): Observable<HouseSpecifications[]> {
    return this.http.get<HouseSpecifications[]>(`${this.apiURL}/project/${projectId}`);
  }

  //create
  createHouseSpecifications(specifications: HouseSpecifications): Observable<HouseSpecifications> {
    return this.http.post<any>(this.apiURL, specifications).pipe(
      map(response => {
        const id = response.data;
        return { ...specifications, id };
      })
    );
  }
  

  getById(id: string, projectId: string): Observable<HouseSpecifications> {
    return this.http.get<HouseSpecifications>(`${this.apiURL}/specs/${id}/project/${projectId}`);
  }

  update(id: string, specifications: HouseSpecifications): Observable<HouseSpecifications | null> {
    return this.http.put<void>(`${this.apiURL}/${id}`, specifications).pipe(
      map(() => {
        return {...specifications, id}; 
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      map(() => undefined) 
    );
  }
}
