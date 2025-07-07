import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Designer, VerificationStatus } from '../models/designer.model';
import { CertificateModel } from '../models/certificate.model';
import { Admin } from '../models/admin.model';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiURL ='http://localhost:5042/api/v1/Admin';
  
  constructor(private http: HttpClient, private router: Router) { }
  
  getDesignerCertificates(token: string, status?: VerificationStatus): Observable<Designer[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    let url = `${this.apiURL}/designer-certificates`;
    if (status) {
      url += `?status=${status}`;
    }
    
    return this.http.get<Designer[]>(url, { headers });
  }


  validateDesignerCertificate(designerId:string| undefined, command: CertificateModel, token: string
    
   ): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    const url = `${this.apiURL}/validate-certificate/${designerId}`;
    return this.http.post<boolean>(url, command, {headers});
  }

  update(id: string, admin:Admin, token: string): Observable<Admin> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    
      return this.http.put<Admin>(`${this.apiURL}/${id}`, admin, { headers });
    }
  
    delete(id: string, token: string): Observable<void> {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.delete(`${this.apiURL}/${id}`, { headers }).pipe(
        map(() => undefined) 
      );
    }


  
}
