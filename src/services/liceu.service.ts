import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Liceu {
  liceu: string;
  profil: string;
  medieMinima: number;
  [key: string]: string | number;

}

@Injectable({ providedIn: 'root' })
export class LiceuService {
  private apiUrl = 'http://localhost:3000/api/licee';

  constructor(private http: HttpClient) {}

  getLicee(an: number, judet: string, media: number): Observable<Liceu[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${an}/${judet}/${media}`).pipe(
      map((response) =>
        response.map((item) => ({
          liceu: item.liceu,
          profil: item.specializarea,
          medieMinima: item.medieAdmitere,
        }))
      )
    );
  }
}
