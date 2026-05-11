import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── isLoggedIn ────────────────────────────────────────────────────
  describe('isLoggedIn', () => {
    it('should return false when no token', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  // ── getRole ───────────────────────────────────────────────────────
  describe('getRole', () => {
    it('should return null when no role stored', () => {
      expect(service.getRole()).toBeNull();
    });

    it('should return Admin role', () => {
      localStorage.setItem('role', 'Admin');
      expect(service.getRole()).toBe('Admin');
    });

    it('should return Passenger role', () => {
      localStorage.setItem('role', 'Passenger');
      expect(service.getRole()).toBe('Passenger');
    });
  });

  // ── isAdmin ───────────────────────────────────────────────────────
  describe('isAdmin', () => {
    it('should return true when role is Admin', () => {
      localStorage.setItem('role', 'Admin');
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when role is Passenger', () => {
      localStorage.setItem('role', 'Passenger');
      expect(service.isAdmin()).toBe(false);
    });
  });

  // ── isPassenger ───────────────────────────────────────────────────
  describe('isPassenger', () => {
    it('should return true when role is Passenger', () => {
      localStorage.setItem('role', 'Passenger');
      expect(service.isPassenger()).toBe(true);
    });

    it('should return false when role is Admin', () => {
      localStorage.setItem('role', 'Admin');
      expect(service.isPassenger()).toBe(false);
    });
  });

  // ── getToken ──────────────────────────────────────────────────────
  describe('getToken', () => {
    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });
  });

  // ── logout ────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should clear token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should clear role from localStorage', () => {
      localStorage.setItem('role', 'Passenger');
      service.logout();
      expect(localStorage.getItem('role')).toBeNull();
    });

    it('should set currentUser to null', () => {
      service.logout();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  // ── login ─────────────────────────────────────────────────────────
  describe('login', () => {
    it('should store token after successful login', () => {
      service.login({ email: 'test@test.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
      req.flush({
        accessToken: 'token123',
        role: 'Passenger',
        fullName: 'Test User',
        email: 'test@test.com',
        userId: 1
      });

      expect(localStorage.getItem('token')).toBe('token123');
    });

    it('should store role after successful login', () => {
      service.login({ email: 'admin@test.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
      req.flush({
        accessToken: 'token123',
        role: 'Admin',
        fullName: 'Admin User',
        email: 'admin@test.com',
        userId: 2
      });

      expect(localStorage.getItem('role')).toBe('Admin');
    });

    it('should store userId after login', () => {
      service.login({ email: 'test@test.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
      req.flush({
        accessToken: 'token123',
        role: 'Passenger',
        userId: 5
      });

      expect(localStorage.getItem('userId')).toBe('5');
    });

    it('should make POST request to login endpoint', () => {
      service.login({ email: 'test@test.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  // ── register ──────────────────────────────────────────────────────
  describe('register', () => {
    it('should make POST request to register endpoint', () => {
      const userData = {
        fullName: 'Test User',
        email: 'test@test.com',
        password: '123456'
      };
      service.register(userData).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/register'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush({ message: 'Registered successfully' });
    });
  });

  // ── getCurrentUser ────────────────────────────────────────────────
  describe('getCurrentUser', () => {
    it('should return null when not logged in', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return user after login', () => {
      service.login({ email: 'test@test.com', password: '123456' }).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/auth/login'));
      req.flush({
        accessToken: 'token123',
        role: 'Passenger',
        fullName: 'Test User',
        email: 'test@test.com',
        userId: 1
      });

      const user = service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.role).toBe('Passenger');
      expect(user?.token).toBe('token123');
    });
  });
});