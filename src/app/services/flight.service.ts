import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Flight {
  flightId: number;
  flightNumber: string;
  airlineId: number;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraftType: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  status: string;
}

// City name / alias → IATA code mapping
export const CITY_TO_CODE: Record<string, string> = {
  'delhi': 'DEL', 'new delhi': 'DEL', 'del': 'DEL', 'indira gandhi': 'DEL',
  'mumbai': 'BOM', 'bombay': 'BOM', 'bom': 'BOM',
  'bangalore': 'BLR', 'bengaluru': 'BLR', 'blr': 'BLR',
  'chennai': 'MAA', 'madras': 'MAA', 'maa': 'MAA',
  'kolkata': 'CCU', 'calcutta': 'CCU', 'ccu': 'CCU',
  'hyderabad': 'HYD', 'hyd': 'HYD',
  'pune': 'PNQ', 'pnq': 'PNQ',
  'ahmedabad': 'AMD', 'amd': 'AMD',
  'goa': 'GOI', 'goi': 'GOI',
  'jaipur': 'JAI', 'jai': 'JAI',
  'lucknow': 'LKO', 'lko': 'LKO',
  'kochi': 'COK', 'cochin': 'COK', 'cok': 'COK',
  'dubai': 'DXB', 'dxb': 'DXB',
  'london': 'LHR', 'lhr': 'LHR',
  'singapore': 'SIN', 'sin': 'SIN',
  'new york': 'JFK', 'jfk': 'JFK',
  'paris': 'CDG', 'cdg': 'CDG',
  'tokyo': 'NRT', 'nrt': 'NRT',
};

export function resolveAirportCode(input: string): string {
  const normalized = input.trim().toLowerCase();
  return CITY_TO_CODE[normalized]?.toUpperCase() ?? input.trim().toUpperCase();
}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private apiUrl = `${environment.flightApiUrl}/flights`;

  constructor(private http: HttpClient) {}

  searchFlights(origin: string, destination: string, date: string): Observable<Flight[]> {
    const params = new HttpParams()
      .set('origin', resolveAirportCode(origin))
      .set('destination', resolveAirportCode(destination))
      .set('date', date);
    return this.http.get<Flight[]>(`${this.apiUrl}/search`, { params });
  }

  getFlightById(flightId: number): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/${flightId}`);
  }

  addFlight(flight: any): Observable<Flight> {
    return this.http.post<Flight>(this.apiUrl, flight);
  }

  // ✅ Called after booking is confirmed — decrements availableSeats on the flight
  decrementSeats(flightId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${flightId}/decrement-seats`, {});
  }

  // ✅ Called when a booking is cancelled — restores availableSeats
  incrementSeats(flightId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${flightId}/increment-seats`, {});
  }

  deleteFlight(flightId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${flightId}`);
  }
}
