import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── createBooking ─────────────────────────────────────────────────
  describe('createBooking', () => {
    it('should make POST request to bookings endpoint', () => {
      const bookingData = {
        flightId: 1,
        userId: 1,
        seatIds: ['1A'],
        totalFare: 9438
      };

      service.createBooking(bookingData).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings') && req.method === 'POST'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(bookingData);
      req.flush({ bookingId: 'abc123', pnrCode: 'PNR001' });
    });

    it('should return booking response', () => {
      const mockResponse = { bookingId: 'abc123', pnrCode: 'PNR001', status: 'Pending' };

      service.createBooking({}).subscribe(res => {
        expect(res.bookingId).toBe('abc123');
        expect(res.pnrCode).toBe('PNR001');
      });

      const req = httpMock.expectOne(req => req.url.includes('/bookings'));
      req.flush(mockResponse);
    });
  });

  // ── getMyBookings ─────────────────────────────────────────────────
  describe('getMyBookings', () => {
    it('should make GET request with userId from localStorage', () => {
      localStorage.setItem('userId', '5');

      service.getMyBookings().subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings/user/5')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return bookings array', () => {
      localStorage.setItem('userId', '1');
      const mockBookings = [
        { bookingId: 'abc123', pnrCode: 'PNR001', status: 'Pending' },
        { bookingId: 'def456', pnrCode: 'PNR002', status: 'Confirmed' }
      ];

      service.getMyBookings().subscribe(bookings => {
        expect(bookings.length).toBe(2);
        expect(bookings[0].pnrCode).toBe('PNR001');
      });

      const req = httpMock.expectOne(req => req.url.includes('/bookings/user/1'));
      req.flush(mockBookings);
    });

    it('should return empty array when no bookings', () => {
      localStorage.setItem('userId', '1');

      service.getMyBookings().subscribe(bookings => {
        expect(bookings.length).toBe(0);
      });

      const req = httpMock.expectOne(req => req.url.includes('/bookings/user/1'));
      req.flush([]);
    });
  });

  // ── getBookingByPnr ───────────────────────────────────────────────
  describe('getBookingByPnr', () => {
    it('should make GET request with correct PNR', () => {
      service.getBookingByPnr('PNR001').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings/pnr/PNR001')
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return booking data for given PNR', () => {
      const mockBooking = {
        bookingId: 'abc123',
        pnrCode: 'PNR001',
        status: 'Confirmed',
        flightId: 2
      };

      service.getBookingByPnr('PNR001').subscribe(booking => {
        expect(booking.pnrCode).toBe('PNR001');
        expect(booking.status).toBe('Confirmed');
      });

      const req = httpMock.expectOne(req => req.url.includes('/bookings/pnr/PNR001'));
      req.flush(mockBooking);
    });
  });

  // ── cancelBooking ─────────────────────────────────────────────────
  describe('cancelBooking', () => {
    it('should make PUT request to cancel booking', () => {
      service.cancelBooking('abc123').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings/abc123/cancel')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Booking cancelled' });
    });

    it('should return cancellation response', () => {
      const mockResponse = { message: 'Booking cancelled successfully' };

      service.cancelBooking('abc123').subscribe(res => {
        expect(res.message).toBe('Booking cancelled successfully');
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings/abc123/cancel')
      );
      req.flush(mockResponse);
    });

    it('should send empty body with cancel request', () => {
      service.cancelBooking('abc123').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/bookings/abc123/cancel')
      );
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });
});