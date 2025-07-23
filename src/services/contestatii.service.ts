import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContestatiiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getContestatii(an: number, judet: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/contestatii/${an}/${judet}`);
}

 getJudete(): Observable<{ label: string; value: string }[]> {
  return this.http.get<{ label: string; value: string }[]>(`${this.apiUrl}/api/judete`);
}
}
