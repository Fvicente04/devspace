// Manages auth state: GitHub login redirect, token storage, and session lifecycle
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ENVIRONMENT } from './environment.token';

const TOKEN_KEY = 'devspace_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private env = inject(ENVIRONMENT);
  private router = inject(Router);

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
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
