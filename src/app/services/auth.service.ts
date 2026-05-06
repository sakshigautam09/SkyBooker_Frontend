import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  // camelCase (ASP.NET Core default JSON serialization)
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  // PascalCase fallback (in case backend configured differently)
  AccessToken?: string;
  RefreshToken?: string;
  ExpiresAt?: string;
  UserId?: number;
  FullName?: string;
  Email?: string;
  Role?: string;
}

export interface CurrentUser {
  token: string;
  role: 'Admin' | 'Passenger' | 'AirlineStaff';
  fullName?: string;
  email?: string;
  userId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.authApiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restore session from localStorage on app start
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as CurrentUser['role'] | null;
    const fullName = localStorage.getItem('fullName') || undefined;
    const email = localStorage.getItem('email') || undefined;
    const userId = localStorage.getItem('userId');
    if (token && role) {
      this.currentUserSubject.next({
        token, role, fullName, email,
        userId: userId ? parseInt(userId) : undefined
      });
    }
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Called after register — auto-login uses this same method
  private storeSession(res: LoginResponse) {
    // Support both camelCase and PascalCase responses
    const token    = res.accessToken  || res.AccessToken  || '';
    const rawRole  = res.role         || res.Role         || 'Passenger';
    const fullName = res.fullName     || res.FullName     || '';
    const email    = res.email        || res.Email        || '';
    const userId   = res.userId       ?? res.UserId       ?? 0;

    // Normalize role — backend sends 'Admin', 'Passenger', 'AirlineStaff'
    const role = this.normalizeRole(rawRole);

    localStorage.setItem('token',    token);
    localStorage.setItem('role',     role);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email',    email);
    localStorage.setItem('userId',   String(userId));

    this.currentUserSubject.next({ token, role, fullName, email, userId });

    console.log('[AuthService] Session stored — role:', role, '| raw:', rawRole);
  }

  private normalizeRole(raw: string): CurrentUser['role'] {
    const lower = raw.toLowerCase();
    if (lower === 'admin')        return 'Admin';
    if (lower === 'airlinestaff') return 'AirlineStaff';
    return 'Passenger';
  }

  logout() {
    ['token', 'role', 'fullName', 'email', 'userId'].forEach(k => localStorage.removeItem(k));
    this.currentUserSubject.next(null);
  }

  getToken()  { return localStorage.getItem('token'); }
  getRole()   { return localStorage.getItem('role') as CurrentUser['role'] | null; }
  isLoggedIn(){ return !!this.getToken(); }
  isAdmin()   { return this.getRole() === 'Admin'; }
  isPassenger(){ return this.getRole() === 'Passenger'; }
  getCurrentUser(): CurrentUser | null { return this.currentUserSubject.value; }
}