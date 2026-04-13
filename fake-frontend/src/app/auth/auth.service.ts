import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, throwError, tap } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Preferences {
  [tag: string]: number;
}

interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api/users';
  private readonly accessTokenKey = 'auth_access_token';
  private readonly refreshTokenKey = 'auth_refresh_token';
  user = signal<User | null>(null);

  constructor(private http: HttpClient) {
    if (this.getAccessToken()) {
      this.loadUser();
    }
  }

  private normalizeError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      return error.error.error || error.error.detail || 'Сервер вернул ошибку';
    }
    return 'Произошла ошибка сети';
  }

  loadUser(): void {
    this.http
      .get<{ user: User }>(`${this.apiUrl}/user/`)
      .pipe(
        tap((response) => this.user.set(response.user)),
        catchError(() => {
          this.clearTokens();
          this.user.set(null);
          return of(null);
        })
      )
      .subscribe();
  }

  private saveTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(this.accessTokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.refreshTokenKey);
  }

  register(credentials: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/`, credentials)
      .pipe(
        tap((response) => {
          this.saveTokens(response.access, response.refresh);
          this.user.set(response.user);
        }),
        catchError((error) => throwError(() => new Error(this.normalizeError(error))))
      );
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login/`, credentials)
      .pipe(
        tap((response) => {
          this.saveTokens(response.access, response.refresh);
          this.user.set(response.user);
        }),
        catchError((error) => throwError(() => new Error(this.normalizeError(error))))
      );
  }

  logout(): Observable<void> {
    const refresh = this.getRefreshToken();
    return this.http.post<void>(`${this.apiUrl}/logout/`, { refresh }).pipe(
      tap(() => {
        this.clearTokens();
        this.user.set(null);
      }),
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }

  getPreferences(): Observable<{ preferences: Preferences }> {
    return this.http.get<{ preferences: Preferences }>(`${this.apiUrl}/preferences/`).pipe(
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }

  resetPreferences(): Observable<{ preferences: Preferences }> {
    return this.http.post<{ preferences: Preferences }>(`${this.apiUrl}/preferences/reset/`, {}).pipe(
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }
}
