import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface Contestatie {
    id: string;
    materie: string;
    notaInitiala: number;
    notaDupaContestatie: number;
    diferenta: number; 
  }
    
@Injectable({
  providedIn: 'root'
})

export class ContestatiiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

getContestatii(an: number, judet: string): Observable<Contestatie[]> {
  return this.http
    .get<any[]>(`${this.apiUrl}/api/contestatii/${an}/${judet}`)
    .pipe(
      map(arr =>
        arr.map(item => ({
          id:                  item.cod,
          materie:             item.materie,
          notaInitiala:        item.nota_initiala,
          notaDupaContestatie: item.nota_finala,
          diferenta:           (item.nota_finala ?? 0)
                                - (item.nota_initiala ?? 0)
        } as Contestatie))
      )
    );
}


 getJudete(): Observable<{ label: string; value: string }[]> {
  return this.http.get<{ label: string; value: string }[]>(`${this.apiUrl}/api/judete`);
}
}
