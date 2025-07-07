import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = 'http://localhost:5042/api/v1/Client'; 

  constructor(private http: HttpClient) {}

  sendResetLink(email: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/forgot-password?email=${email}`, null);
  }

  resetPassword(email:string, token: string, newPassword: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/reset-password`, {email, token, newPassword });
  }
}