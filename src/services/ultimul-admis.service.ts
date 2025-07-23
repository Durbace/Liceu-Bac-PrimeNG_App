import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UltimAdmisRecord {
  medieUltim: number;
  pozitiaUltim: number;
}

@Injectable({ providedIn: 'root' })
export class UltimulAdmisService {
  constructor(private http: HttpClient) {}

  getJudete(): Observable<{ label: string; value: string }[]> {
    return this.http.get<{ label: string; value: string }[]>('/api/judete');
  }

  getUltimulAdmis(
    judet?: string
  ): Observable<Record<string, Record<string, UltimAdmisRecord>>> {
    let url = '/api/ultimul-admis';
    if (judet) {
      url += `?judet=${judet}`;
    }
    return this.http.get<Record<string, Record<string, UltimAdmisRecord>>>(url);
  }
}
