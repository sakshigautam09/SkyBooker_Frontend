import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.bookingApiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, bookingData);
  }

  getMyBookings(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getBookingByPnr(pnr: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pnr/${pnr}`);
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${bookingId}/cancel`, {});
  }
}