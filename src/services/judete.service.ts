import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JudeteService {
  readonly judete: { nume: string; cod: string }[] = [
    { nume: 'Alba', cod: 'AB' },
    { nume: 'Arad', cod: 'AR' },
    { nume: 'Argeș', cod: 'AG' },
    { nume: 'Bacău', cod: 'BC' },
    { nume: 'Bihor', cod: 'BH' },
    { nume: 'Bistrița-Năsăud', cod: 'BN' },
    { nume: 'Botoșani', cod: 'BT' },
    { nume: 'Brașov', cod: 'BV' },
    { nume: 'Brăila', cod: 'BR' },
    { nume: 'Buzău', cod: 'BZ' },
    { nume: 'Caraș-Severin', cod: 'CS' },
    { nume: 'Călărași', cod: 'CL' },
    { nume: 'Cluj', cod: 'CJ' },
    { nume: 'Constanța', cod: 'CT' },
    { nume: 'Covasna', cod: 'CV' },
    { nume: 'Dâmbovița', cod: 'DB' },
    { nume: 'Dolj', cod: 'DJ' },
    { nume: 'Galați', cod: 'GL' },
    { nume: 'Giurgiu', cod: 'GR' },
    { nume: 'Gorj', cod: 'GJ' },
    { nume: 'Harghita', cod: 'HR' },
    { nume: 'Hunedoara', cod: 'HD' },
    { nume: 'Ialomița', cod: 'IL' },
    { nume: 'Iași', cod: 'IS' },
    { nume: 'Ilfov', cod: 'IF' },
    { nume: 'Maramureș', cod: 'MM' },
    { nume: 'Mehedinți', cod: 'MH' },
    { nume: 'Mureș', cod: 'MS' },
    { nume: 'Neamț', cod: 'NT' },
    { nume: 'Olt', cod: 'OT' },
    { nume: 'Prahova', cod: 'PH' },
    { nume: 'Satu Mare', cod: 'SM' },
    { nume: 'Sălaj', cod: 'SJ' },
    { nume: 'Sibiu', cod: 'SB' },
    { nume: 'Suceava', cod: 'SV' },
    { nume: 'Teleorman', cod: 'TR' },
    { nume: 'Timiș', cod: 'TM' },
    { nume: 'Tulcea', cod: 'TL' },
    { nume: 'Vaslui', cod: 'VS' },
    { nume: 'Vâlcea', cod: 'VL' },
    { nume: 'Vrancea', cod: 'VN' },
    { nume: 'București', cod: 'B' },
  ];

  getAllNames(): string[] {
    return this.judete.map((j) => j.nume);
  }

  getAllCodes(): string[] {
    return this.judete.map((j) => j.cod);
  }

  getCodeByName(nume: string): string | undefined {
    return this.judete.find((j) => j.nume === nume)?.cod;
  }

  getNameByCode(cod: string): string | undefined {
    return this.judete.find((j) => j.cod === cod)?.nume;
  }
}
