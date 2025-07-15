import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnService {
  private apiUrl = environment.apiUrl + '/api/ani-disponibili';

  constructor(private http: HttpClient) {}

  getAniDisponibili(): Observable<number[]> {
    return this.http.get<number[]>(this.apiUrl);
  }
}
