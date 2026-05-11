import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SeatService } from './seat.service';

describe('SeatService', () => {
  let service: SeatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SeatService]
    });
    service = TestBed.inject(SeatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── getSeatsByFlight ──────────────────────────────────────────────
  describe('getSeatsByFlight', () => {
    it('should make GET request to seat map endpoint', () => {
      service.getSeatsByFlight(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats/1/map')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return seats array', () => {
      const mockSeats = [
        { seatId: 1, seatNumber: '1A', status: 'Available', seatClass: 'Economy' },
        { seatId: 2, seatNumber: '1B', status: 'Held', seatClass: 'Economy' }
      ];

      service.getSeatsByFlight(1).subscribe(seats => {
        expect(seats.length).toBe(2);
        expect(seats[0].seatNumber).toBe('1A');
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats/1/map'));
      req.flush(mockSeats);
    });
  });

  // ── getAvailableSeats ─────────────────────────────────────────────
  describe('getAvailableSeats', () => {
    it('should make GET request to available seats endpoint', () => {
      service.getAvailableSeats(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats/1/available')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return only available seats', () => {
      const mockSeats = [
        { seatId: 1, seatNumber: '1A', status: 'Available' },
        { seatId: 3, seatNumber: '2A', status: 'Available' }
      ];

      service.getAvailableSeats(1).subscribe(seats => {
        expect(seats.length).toBe(2);
        expect(seats[0].status).toBe('Available');
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats/1/available'));
      req.flush(mockSeats);
    });
  });

  // ── holdSeat ──────────────────────────────────────────────────────
  describe('holdSeat', () => {
    it('should make PUT request to hold seat', () => {
      service.holdSeat(1, 5).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats/seat/1/hold')
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ userId: 5 });
      req.flush({});
    });

    it('should return held seat data', () => {
      const mockSeat = { seatId: 1, status: 'Held', heldByUserId: 5 };

      service.holdSeat(1, 5).subscribe(seat => {
        expect(seat.status).toBe('Held');
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats/seat/1/hold'));
      req.flush(mockSeat);
    });
  });

  // ── releaseSeat ───────────────────────────────────────────────────
  describe('releaseSeat', () => {
    it('should make PUT request to release seat', () => {
      service.releaseSeat(1, 5).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats/seat/1/release')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should return released seat data', () => {
      const mockSeat = { seatId: 1, status: 'Available' };

      service.releaseSeat(1, 5).subscribe(seat => {
        expect(seat.status).toBe('Available');
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats/seat/1/release'));
      req.flush(mockSeat);
    });
  });

  // ── confirmSeat ───────────────────────────────────────────────────
  describe('confirmSeat', () => {
    it('should make PUT request to confirm seat', () => {
      service.confirmSeat(1, 5).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats/seat/1/confirm')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should return confirmed seat data', () => {
      const mockSeat = { seatId: 1, status: 'Confirmed' };

      service.confirmSeat(1, 5).subscribe(seat => {
        expect(seat.status).toBe('Confirmed');
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats/seat/1/confirm'));
      req.flush(mockSeat);
    });
  });

  // ── addSeat ───────────────────────────────────────────────────────
  describe('addSeat', () => {
    it('should make POST request to seats endpoint', () => {
      const seatData = {
        flightId: 1,
        seatNumber: '1A',
        seatClass: 'Economy',
        row: 1,
        column: 'A'
      };

      service.addSeat(seatData).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats') && req.method === 'POST'
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  // ── addSeatsBulk ──────────────────────────────────────────────────
  describe('addSeatsBulk', () => {
    it('should make POST request with seats array', () => {
      const seats = [
        { flightId: 1, seatNumber: '1A', seatClass: 'Economy' },
        { flightId: 1, seatNumber: '1B', seatClass: 'Economy' },
        { flightId: 1, seatNumber: '1C', seatClass: 'Business' }
      ];

      service.addSeatsBulk(seats).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/seats') && req.method === 'POST'
      );
      expect(req.request.body).toEqual(seats);
      req.flush(seats);
    });

    it('should return created seats array', () => {
      const mockSeats = [
        { seatId: 1, seatNumber: '1A', status: 'Available' },
        { seatId: 2, seatNumber: '1B', status: 'Available' }
      ];

      service.addSeatsBulk([{}, {}]).subscribe(seats => {
        expect(seats.length).toBe(2);
      });

      const req = httpMock.expectOne(req => req.url.includes('/seats'));
      req.flush(mockSeats);
    });
  });
});