import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailVerificationService {
  private apiURL ='http://localhost:5042/api/v1/Client';

  constructor(private http: HttpClient) {}

  checkEmailExists(email: string): Observable<boolean> {
      return this.http.get<{ exists: boolean }>(`${this.apiURL}/check-email?email=${email}`).pipe(
        map((response: any) => response.exists)
      );
    }
}