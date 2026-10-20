import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatResponse {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class BikeRepairApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  askQuestion(question: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(
      `${this.baseUrl}/chat/ask`,
      { question }
    );
  }

  uploadPdf(file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/knowledge/upload`,
      formData
    );
  }
}