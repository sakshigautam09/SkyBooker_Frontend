import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FlightService, resolveAirportCode, CITY_TO_CODE } from './flight.service';

describe('FlightService', () => {
  let service: FlightService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FlightService]
    });
    service = TestBed.inject(FlightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── resolveAirportCode ────────────────────────────────────────────
  describe('resolveAirportCode', () => {
    it('should resolve delhi to DEL', () => {
      expect(resolveAirportCode('delhi')).toBe('DEL');
    });

    it('should resolve mumbai to BOM', () => {
      expect(resolveAirportCode('mumbai')).toBe('BOM');
    });

    it('should resolve bangalore to BLR', () => {
      expect(resolveAirportCode('bangalore')).toBe('BLR');
    });

    it('should resolve bengaluru to BLR', () => {
      expect(resolveAirportCode('bengaluru')).toBe('BLR');
    });

    it('should resolve chennai to MAA', () => {
      expect(resolveAirportCode('chennai')).toBe('MAA');
    });

    it('should resolve hyderabad to HYD', () => {
      expect(resolveAirportCode('hyderabad')).toBe('HYD');
    });

    it('should resolve goa to GOI', () => {
      expect(resolveAirportCode('goa')).toBe('GOI');
    });

    it('should return uppercase input when city not found', () => {
      expect(resolveAirportCode('xyz')).toBe('XYZ');
    });

    it('should handle uppercase input', () => {
      expect(resolveAirportCode('DELHI')).toBe('DEL');
    });

    it('should handle mixed case input', () => {
      expect(resolveAirportCode('Mumbai')).toBe('BOM');
    });

    it('should handle input with spaces', () => {
      expect(resolveAirportCode('new delhi')).toBe('DEL');
    });

    it('should resolve direct IATA code DEL', () => {
      expect(resolveAirportCode('DEL')).toBe('DEL');
    });
  });

  // ── CITY_TO_CODE ──────────────────────────────────────────────────
  describe('CITY_TO_CODE', () => {
    it('should contain delhi mapping', () => {
      expect(CITY_TO_CODE['delhi']).toBe('DEL');
    });

    it('should contain mumbai mapping', () => {
      expect(CITY_TO_CODE['mumbai']).toBe('BOM');
    });

    it('should contain dubai mapping', () => {
      expect(CITY_TO_CODE['dubai']).toBe('DXB');
    });

    it('should contain london mapping', () => {
      expect(CITY_TO_CODE['london']).toBe('LHR');
    });
  });

  // ── searchFlights ─────────────────────────────────────────────────
  describe('searchFlights', () => {
    it('should make GET request with correct params', () => {
      service.searchFlights('delhi', 'mumbai', '2026-05-10').subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/flights/search') &&
        req.params.get('origin') === 'DEL' &&
        req.params.get('destination') === 'BOM'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should resolve city names to airport codes', () => {
      service.searchFlights('bangalore', 'chennai', '2026-05-10').subscribe();

      const req = httpMock.expectOne(req =>
        req.params.get('origin') === 'BLR' &&
        req.params.get('destination') === 'MAA'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should return flights array', () => {
      const mockFlights = [
        {
          flightId: 1,
          flightNumber: 'SKY-101',
          originAirportCode: 'DEL',
          destinationAirportCode: 'BOM',
          basePrice: 5000,
          status: 'Scheduled'
        }
      ];

      service.searchFlights('delhi', 'mumbai', '2026-05-10').subscribe(flights => {
        expect(flights.length).toBe(1);
        expect(flights[0].flightNumber).toBe('SKY-101');
      });

      const req = httpMock.expectOne(req => req.url.includes('/flights/search'));
      req.flush(mockFlights);
    });
  });

  // ── getFlightById ─────────────────────────────────────────────────
  describe('getFlightById', () => {
    it('should make GET request with correct flight ID', () => {
      service.getFlightById(1).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/flights/1'));
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return flight data', () => {
      const mockFlight = { flightId: 2, flightNumber: 'SKY-102', basePrice: 7999 };

      service.getFlightById(2).subscribe(flight => {
        expect(flight.flightId).toBe(2);
        expect(flight.flightNumber).toBe('SKY-102');
      });

      const req = httpMock.expectOne(req => req.url.includes('/flights/2'));
      req.flush(mockFlight);
    });
  });

  // ── addFlight ─────────────────────────────────────────────────────
  describe('addFlight', () => {
    it('should make POST request to flights endpoint', () => {
      const flightData = {
        flightNumber: 'SKY-103',
        basePrice: 9999,
        status: 'Scheduled'
      };

      service.addFlight(flightData).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/flights') && req.method === 'POST'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(flightData);
      req.flush(flightData);
    });
  });

  // ── decrementSeats ────────────────────────────────────────────────
  describe('decrementSeats', () => {
    it('should make PUT request to decrement seats', () => {
      service.decrementSeats(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/flights/1/decrement-seats')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  // ── incrementSeats ────────────────────────────────────────────────
  describe('incrementSeats', () => {
    it('should make PUT request to increment seats', () => {
      service.incrementSeats(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/flights/1/increment-seats')
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  // ── deleteFlight ──────────────────────────────────────────────────
  describe('deleteFlight', () => {
    it('should make DELETE request with correct flight ID', () => {
      service.deleteFlight(1).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/flights/1') && req.method === 'DELETE'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});