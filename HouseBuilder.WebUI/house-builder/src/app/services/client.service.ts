import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Client } from '../models/client.model';


@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiURL ='http://localhost:5042/api/v1/Client';
  private apiURL2 ='http://localhost:5042/api/v1/Files';

  
  constructor(private http: HttpClient, private router: Router) { }

  getClients() : Observable<Client[]> {
    return this.http.get<Client[]>(this.apiURL);
  }

  //create
  createClient(client : Client) : Observable<any> {
    return this.http.post<Client>(this.apiURL, client);
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.apiURL}/check-email?email=${email}`).pipe(
      map((response: any) => response.exists)
    );
  }
  uploadProfilePicture(file: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiURL2}/upload-profile`, file);
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiURL}/${id}`);
  }
  updatePassword(id: string, command: { clientId: string; password: string }, token: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put<void>(`${this.apiURL}/${id}/update-password`, command, { headers });
  }
 

  update(id: string, client: Client, token: string): Observable<Client> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.put<Client>(`${this.apiURL}/${id}`, client, { headers });
  }

  delete(id: string, token: string): Observable<void> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete(`${this.apiURL}/${id}`, { headers }).pipe(
      map(() => undefined) 
    );
  }
}
