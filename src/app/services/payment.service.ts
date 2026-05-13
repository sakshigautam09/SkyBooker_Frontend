import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.paymentApiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initiatePayment(data: {
    bookingId: string;
    userId: number;
    amount: number;
    currency: string;
    paymentMode: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/initiate`, data);
  }

  simulateSuccess(paymentId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${paymentId}/simulate-success`, {});
  }
}