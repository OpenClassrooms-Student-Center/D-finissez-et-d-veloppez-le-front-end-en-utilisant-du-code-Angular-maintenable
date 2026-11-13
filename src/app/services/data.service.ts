import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Olympic } from '../models/olympic.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) {}

  getOlympics(): Observable<Olympic[]> {
    return this.http.get<Olympic[]>(this.olympicUrl);
  }

  getOlympicById(id: number): Observable<Olympic | undefined> {
    return this.getOlympics().pipe(
      map((olympics) => olympics.find((olympic) => olympic.id === id))
    );
  }

  getTotalMedals(olympic: Olympic): number {
    return olympic.participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  getTotalAthletes(olympic: Olympic): number {
    return olympic.participations.reduce((total, p) => total + p.athleteCount, 0);
  }

  getNumberOfJOs(olympics: Olympic[]): number {
    const years = olympics.flatMap((olympic) => olympic.participations.map((p) => p.year));
    return new Set(years).size;
  }
}
