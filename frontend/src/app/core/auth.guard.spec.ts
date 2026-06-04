// Tests that authGuard allows authenticated users and redirects unauthenticated ones
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ENVIRONMENT } from './environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
  }

  it('returns true when user is authenticated', () => {
    localStorage.setItem('devspace_token', 'valid_token');
    expect(runGuard()).toBe(true);
  });

  it('returns false and redirects to /login when not authenticated', () => {
    const spy = vi.spyOn(router, 'navigate');
    const result = runGuard();
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
