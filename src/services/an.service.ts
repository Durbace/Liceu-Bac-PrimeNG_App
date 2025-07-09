import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnService {
  private apiUrl = 'http://localhost:3000/api/ani-disponibili';

  constructor(private http: HttpClient) {}

  getAniDisponibili(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl);
  }
}
