import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Elev {
  liceu: string;
  specializarea: string;
  medieAdmitere: number | null;
  status: 'REUȘIT' | 'RESPINS' | 'NEPREZENTAT' | 'NECUNOSCUT';
}

@Injectable({
  providedIn: 'root',
})
export class BacStatisticiService {
  constructor(private http: HttpClient) {}

  getEleviDinJudet(judet: string): Observable<Elev[]> {
    const url = `http://localhost:3000/api/bac/${judet}`;

    return this.http.get<any[]>(url).pipe(
      map((data) =>
        data
          .filter(
            (item) =>
              typeof item.school === 'string' &&
              /Liceu|Colegiu|Seminar|Teologic/i.test(item.school)
          )
          .map((item) => {
            const notaRomana = item.ri;
            const notaMate = item.mi;

            let status: 'REUȘIT' | 'RESPINS' | 'NEPREZENTAT' | 'NECUNOSCUT' =
              'NECUNOSCUT';

            if (notaRomana == null && notaMate == null) {
              status = 'NEPREZENTAT';
            } else if ((notaRomana ?? 0) < 5 || (notaMate ?? 0) < 5) {
              status = 'RESPINS';
            } else {
              status = 'REUȘIT';
            }

            return {
              liceu: item.school,
              specializarea: item.profil || 'General',
              medieAdmitere: item.mev || null,
              status,
            };
          })
      )
    );
  }

  
}
