// Manages auth state: GitHub login redirect, token storage, and session lifecycle
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ENVIRONMENT } from './environment.token';

const TOKEN_KEY = 'devspace_token';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private env = inject(ENVIRONMENT);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<AuthUser | null>(null);

  // Separated for testability — window.location.href cannot be spied on directly
  protected navigateExternal(url: string): void {
    window.location.href = url;
  }

  login(): void {
    this.navigateExternal(`${this.env.apiUrl}/auth/github`);
  }

  handleCallback(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  async loadCurrentUser(): Promise<void> {
    if (!this.isAuthenticated()) {
      this.currentUser.set(null);
      return;
    }

    try {
      const user = await firstValueFrom(this.http.get<AuthUser>(`${this.env.apiUrl}/auth/me`));
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }
}
