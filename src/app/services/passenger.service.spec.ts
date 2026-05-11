import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PassengerService } from './passenger.service';

describe('PassengerService', () => {
  let service: PassengerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PassengerService]
    });
    service = TestBed.inject(PassengerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── addPassenger ──────────────────────────────────────────────────
  describe('addPassenger', () => {
    it('should make POST request to passengers endpoint', () => {
      const dto = { fullName: 'Test User', age: 25, gender: 'Male' };
      service.addPassenger(dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers') && req.method === 'POST'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ passengerId: 1 });
    });

    it('should return passenger response', () => {
      const mockResponse = { passengerId: 1, fullName: 'Test User' };
      service.addPassenger({}).subscribe(res => {
        expect(res.passengerId).toBe(1);
      });

      const req = httpMock.expectOne(req => req.url.includes('/passengers'));
      req.flush(mockResponse);
    });
  });

  // ── getPassengersByBooking ────────────────────────────────────────
  describe('getPassengersByBooking', () => {
    it('should make GET request with correct bookingId', () => {
      service.getPassengersByBooking('abc123').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/booking/abc123')
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return passengers for booking', () => {
      const mockPassengers = [
        { passengerId: 1, fullName: 'User One' },
        { passengerId: 2, fullName: 'User Two' }
      ];

      service.getPassengersByBooking('abc123').subscribe(passengers => {
        expect(passengers.length).toBe(2);
      });

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/booking/abc123')
      );
      req.flush(mockPassengers);
    });
  });

  // ── getPassengerById ──────────────────────────────────────────────
  describe('getPassengerById', () => {
    it('should make GET request with correct passengerId', () => {
      service.getPassengerById(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/1')
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return passenger data', () => {
      const mockPassenger = { passengerId: 1, fullName: 'Test User', age: 25 };

      service.getPassengerById(1).subscribe(passenger => {
        expect(passenger.passengerId).toBe(1);
        expect(passenger.fullName).toBe('Test User');
      });

      const req = httpMock.expectOne(req => req.url.includes('/passengers/1'));
      req.flush(mockPassenger);
    });
  });

  // ── updatePassenger ───────────────────────────────────────────────
  describe('updatePassenger', () => {
    it('should make PUT request with correct passengerId', () => {
      const dto = { fullName: 'Updated User' };
      service.updatePassenger(1, dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/1') && req.method === 'PUT'
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  // ── assignSeat ────────────────────────────────────────────────────
  describe('assignSeat', () => {
    it('should make PUT request to assign-seat endpoint', () => {
      const dto = { seatId: 1, seatNumber: '1A' };
      service.assignSeat(1, dto).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/1/assign-seat')
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(dto);
      req.flush({});
    });
  });

  // ── deletePassenger ───────────────────────────────────────────────
  describe('deletePassenger', () => {
    it('should make DELETE request with correct passengerId', () => {
      service.deletePassenger(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/passengers/1') && req.method === 'DELETE'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});