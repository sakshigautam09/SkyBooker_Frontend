import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private apiUrl = `${environment.passengerServiceUrl}/api/passengers`;

  constructor(private http: HttpClient) {}

  addPassenger(dto: any): Observable<any> {
    return this.http.post(this.apiUrl, dto);
  }

  getPassengersByBooking(bookingId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking/${bookingId}`);
  }

  getPassengerById(passengerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${passengerId}`);
  }

  updatePassenger(passengerId: number, dto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${passengerId}`, dto);
  }

  assignSeat(passengerId: number, dto: { seatId: number; seatNumber: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${passengerId}/assign-seat`, dto);
  }

  deletePassenger(passengerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${passengerId}`);
  }
}