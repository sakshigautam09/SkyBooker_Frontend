import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.notificationServiceUrl}/api/notifications`;
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  sendBookingConfirmation(dto: {
    bookingId:      string;
    recipientId:    number;
    recipientName:  string;
    recipientEmail: string;
    recipientPhone?: string;
    pnrCode:        string;
    flightNumber:   string;
    origin:         string;
    destination:    string;
    departureTime:  string;
    seatNumber:     string;
    totalFare:      number;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/booking-confirmation`, 
      dto, 
      { headers: this.getHeaders() }
    );
  }

  sendNotification(dto: {
    recipientId:       number;
    type:              string;
    title:             string;
    message:           string;
    channel:           string;
    recipientEmail?:   string;
    recipientPhone?:   string;
    relatedBookingId?: string;
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/send`, 
      dto, 
      { headers: this.getHeaders() }
    );
  }

  getByRecipient(recipientId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/recipient/${recipientId}`,
      { headers: this.getHeaders() }
    );
  }

  getUnreadCount(recipientId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/recipient/${recipientId}/unread-count`,
      { headers: this.getHeaders() }
    );
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${notificationId}/read`, 
      {},
      { headers: this.getHeaders() }
    );
  }

  markAllRead(recipientId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/recipient/${recipientId}/mark-all-read`, 
      {},
      { headers: this.getHeaders() }
    );
  }
}