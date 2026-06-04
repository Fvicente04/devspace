// Tests for AuthService — covers all auth state operations
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { ENVIRONMENT } from './environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  describe('login()', () => {
    it('redirects to apiUrl/auth/github', () => {
      const spy = vi.spyOn(service as any, 'navigateExternal');
      service.login();
      expect(spy).toHaveBeenCalledWith('http://localhost:3000/auth/github');
    });
  });

  describe('handleCallback(token)', () => {
    it('stores token in localStorage', () => {
      vi.spyOn(router, 'navigate');
      service.handleCallback('test_jwt');
      expect(localStorage.getItem('devspace_token')).toBe('test_jwt');
    });

    it('navigates to /dashboard', () => {
      const spy = vi.spyOn(router, 'navigate');
      service.handleCallback('test_jwt');
      expect(spy).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('logout()', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('devspace_token', 'existing_token');
      vi.spyOn(router, 'navigate');
      service.logout();
      expect(localStorage.getItem('devspace_token')).toBeNull();
    });

    it('navigates to /login', () => {
      const spy = vi.spyOn(router, 'navigate');
      service.logout();
      expect(spy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken()', () => {
    it('returns token from localStorage when present', () => {
      localStorage.setItem('devspace_token', 'my_token');
      expect(service.getToken()).toBe('my_token');
    });

    it('returns null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated()', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('devspace_token', 'any_token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('returns false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
