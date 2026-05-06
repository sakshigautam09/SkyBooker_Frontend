import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Seat {
  seatId: number;
  flightId: number;
  seatNumber: string;
  seatClass: string;
  row: number;
  column: string;
  isWindow: boolean;
  isAisle: boolean;
  hasExtraLegroom: boolean;
  status: 'Available' | 'Held' | 'Confirmed' | 'Blocked';
  priceMultiplier: number;
  heldSince?: string;
  heldByUserId?: number;
}

@Injectable({ providedIn: 'root' })
export class SeatService {
  private apiUrl = `${environment.seatApiUrl}/seats`;

  constructor(private http: HttpClient) {}

  // GET /api/seats/{flightId}/map
  getSeatsByFlight(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/${flightId}/map`);
  }

  // GET /api/seats/{flightId}/available
  getAvailableSeats(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/${flightId}/available`);
  }

  // PUT /api/seats/seat/{seatId}/hold — body: { userId }
  holdSeat(seatId: number, userId: number): Observable<Seat> {
    return this.http.put<Seat>(`${this.apiUrl}/seat/${seatId}/hold`, { userId });
  }

  // PUT /api/seats/seat/{seatId}/release
  releaseSeat(seatId: number, userId: number): Observable<Seat> {
    return this.http.put<Seat>(`${this.apiUrl}/seat/${seatId}/release`, {});
  }

  // PUT /api/seats/seat/{seatId}/confirm
  confirmSeat(seatId: number, userId: number): Observable<Seat> {
    return this.http.put<Seat>(`${this.apiUrl}/seat/${seatId}/confirm`, {});
  }

  // POST /api/seats — single seat (kept for compatibility)
  addSeat(seatData: any): Observable<Seat> {
    return this.http.post<Seat>(this.apiUrl, seatData);
  }

  // ✅ POST /api/seats — bulk array (used by add-flight seat seeding)
  // SeatController accepts IList<AddSeatRequestDto> so we send the full array
  addSeatsBulk(seats: any[]): Observable<Seat[]> {
    return this.http.post<Seat[]>(this.apiUrl, seats);
  }
}