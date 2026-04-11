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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api';
  user = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  private corsOptions = { withCredentials: true } as const;

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
      .get<{ user: User }>(`${this.apiUrl}/user/`, this.corsOptions)
      .pipe(
        tap((response) => this.user.set(response.user)),
        catchError(() => {
          this.user.set(null);
          return of(null);
        })
      )
      .subscribe();
  }

  register(credentials: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>(`${this.apiUrl}/register/`, credentials, this.corsOptions)
      .pipe(
        tap((response) => this.user.set(response.user)),
        catchError((error) => throwError(() => new Error(this.normalizeError(error))))
      );
  }

  login(credentials: { username: string; password: string }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>(`${this.apiUrl}/login/`, credentials, this.corsOptions)
      .pipe(
        tap((response) => this.user.set(response.user)),
        catchError((error) => throwError(() => new Error(this.normalizeError(error))))
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout/`, {}, this.corsOptions).pipe(
      tap(() => this.user.set(null)),
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }

  getPreferences(): Observable<{ preferences: Preferences }> {
    return this.http.get<{ preferences: Preferences }>(`${this.apiUrl}/preferences/`, this.corsOptions).pipe(
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }

  resetPreferences(): Observable<{ preferences: Preferences }> {
    return this.http.post<{ preferences: Preferences }>(`${this.apiUrl}/preferences/reset/`, {}, this.corsOptions).pipe(
      catchError((error) => throwError(() => new Error(this.normalizeError(error))))
    );
  }
}
