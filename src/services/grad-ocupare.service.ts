import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';

export interface GradOcupareItem {
  judet: string;
  liceu: string;
  specializare: string;
  ocupate: number;
  libere: number;
  total: number;
  procent: string;
  medieUltim: number;
}

@Injectable({ providedIn: 'root' })
export class GradOcupareService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGradOcupare(
  an: number,
  pozitie: number,
  judet?: string
): Observable<{
  complet: GradOcupareItem[];
  partial: GradOcupareItem[];
  neocupat: GradOcupareItem[];
}> {
  const params = new URLSearchParams();
  params.set('pozitie', pozitie.toString());
  if (judet) params.set('judet', judet);

  return this.http.get<{
    complet: GradOcupareItem[];
    partial: GradOcupareItem[];
    neocupat: GradOcupareItem[];
  }>(`${this.apiUrl}/api/analiza-pozitie/${an}?${params.toString()}`);
}

getJudete(): Observable<{ nume: string; cod: string }[]> {
  return this.http.get<{ nume: string; cod: string }[]>(`${this.apiUrl}/api/judete`);
}
}