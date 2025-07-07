// src/app/services/gemini.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExteriorDesignRequest {
  LandSize: string;
  HouseShape: string;
  Budget?: string;
  FamilySize?: string;
  AdditionalRequirements?: string;
}

export interface ExteriorDesignResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiURL = 'http://localhost:5042/api/v1/Gemini'; 
  
  constructor(private http: HttpClient) { }
  
  generateExteriorDesign(request: ExteriorDesignRequest): Observable<ExteriorDesignResponse> {
    return this.http.post<ExteriorDesignResponse>(`${this.apiURL}/generateExteriorDesign`, request);
  }
}