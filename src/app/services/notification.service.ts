import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.notificationServiceUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  // POST /api/notifications/booking-confirmation
  // Sends email with PDF e-ticket + in-app notification
  sendBookingConfirmation(dto: {
    bookingId:     string;
    recipientId:   number;
    recipientName: string;
    recipientEmail: string;
    recipientPhone?: string;
    pnrCode:       string;
    flightNumber:  string;
    origin:        string;
    destination:   string;
    departureTime: string;
    seatNumber:    string;
    totalFare:     number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/booking-confirmation`, dto);
  }

  // POST /api/notifications/send — generic single notification
  sendNotification(dto: {
    recipientId:    number;
    type:           string;
    title:          string;
    message:        string;
    channel:        string;
    recipientEmail?: string;
    recipientPhone?: string;
    relatedBookingId?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, dto);
  }

  // GET /api/notifications/recipient/{recipientId}
  getByRecipient(recipientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recipient/${recipientId}`);
  }

  // GET /api/notifications/recipient/{recipientId}/unread-count
  getUnreadCount(recipientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipient/${recipientId}/unread-count`);
  }

  // PUT /api/notifications/{id}/read
  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // PUT /api/notifications/recipient/{recipientId}/mark-all-read
  markAllRead(recipientId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/recipient/${recipientId}/mark-all-read`, {});
  }
}