import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── sendBookingConfirmation ───────────────────────────────────────
  describe('sendBookingConfirmation', () => {
    it('should make POST request to booking-confirmation endpoint', () => {
      const dto = {
        bookingId: 'abc123',
        recipientId: 1,
        recipientName: 'Test User',
        recipientEmail: 'test@test.com',
        pnrCode: 'PNR001',
        flightNumber: 'SKY-101',
        origin: 'DEL',
        destination: 'BOM',
        departureTime: '2026-05-10T10:00:00',
        seatNumber: '1A',
        totalFare: 9438
      };

      service.sendBookingConfirmation(dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/booking-confirmation')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ message: 'Confirmation sent' });
    });

    it('should include Authorization header', () => {
      const dto = {
        bookingId: 'abc123',
        recipientId: 1,
        recipientName: 'Test User',
        recipientEmail: 'test@test.com',
        pnrCode: 'PNR001',
        flightNumber: 'SKY-101',
        origin: 'DEL',
        destination: 'BOM',
        departureTime: '2026-05-10T10:00:00',
        seatNumber: '1A',
        totalFare: 9438
      };

      service.sendBookingConfirmation(dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/booking-confirmation')
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });

  // ── sendNotification ──────────────────────────────────────────────
  describe('sendNotification', () => {
    it('should make POST request to send endpoint', () => {
      const dto = {
        recipientId: 1,
        type: 'Info',
        title: 'Test Title',
        message: 'Test Message',
        channel: 'App'
      };

      service.sendNotification(dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/send')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });

    it('should include Authorization header', () => {
      service.sendNotification({
        recipientId: 1,
        type: 'Info',
        title: 'Test',
        message: 'Test',
        channel: 'App'
      }).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/send')
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });

  // ── getByRecipient ────────────────────────────────────────────────
  describe('getByRecipient', () => {
    it('should make GET request with correct recipientId', () => {
      service.getByRecipient(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return notifications array', () => {
      const mockNotifications = [
        { notificationId: 1, title: 'Booking Confirmed', isRead: false },
        { notificationId: 2, title: 'Payment Done', isRead: true }
      ];

      service.getByRecipient(1).subscribe(notifications => {
        expect(notifications.length).toBe(2);
        expect(notifications[0].title).toBe('Booking Confirmed');
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1')
      );
      req.flush(mockNotifications);
    });

    it('should include Authorization header', () => {
      service.getByRecipient(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1')
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush([]);
    });
  });

  // ── getUnreadCount ────────────────────────────────────────────────
  describe('getUnreadCount', () => {
    it('should make GET request to unread-count endpoint', () => {
      service.getUnreadCount(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1/unread-count')
      );
      expect(req.request.method).toBe('GET');
      req.flush({ unreadCount: 3 });
    });

    it('should return unread count', () => {
      service.getUnreadCount(1).subscribe(res => {
        expect(res.unreadCount).toBe(5);
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1/unread-count')
      );
      req.flush({ unreadCount: 5 });
    });
  });

  // ── markAsRead ────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('should make PUT request to mark notification as read', () => {
      service.markAsRead(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/1/read')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should include Authorization header', () => {
      service.markAsRead(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/1/read')
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });

  // ── markAllRead ───────────────────────────────────────────────────
  describe('markAllRead', () => {
    it('should make PUT request to mark all notifications as read', () => {
      service.markAllRead(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1/mark-all-read')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should include Authorization header', () => {
      service.markAllRead(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/notifications/recipient/1/mark-all-read')
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });
});