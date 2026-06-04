// Tests that AuthCallbackComponent reads the token query param and delegates correctly
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthCallbackComponent } from './auth-callback.component';
import { AuthService } from '../../core/auth.service';
import { ENVIRONMENT } from '../../core/environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

// Shared mutable params — set before each test, reset in beforeEach
const currentParams: Record<string, string> = {};
const mockRoute = {
  snapshot: { queryParamMap: { get: (k: string) => currentParams[k] ?? null } },
};

describe('AuthCallbackComponent', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    Object.keys(currentParams).forEach((k) => delete currentParams[k]);

    await TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  function setup(params: Record<string, string>) {
    Object.assign(currentParams, params);
    const fixture = TestBed.createComponent(AuthCallbackComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('calls handleCallback with token when token query param exists', () => {
    const spy = vi.spyOn(authService, 'handleCallback').mockImplementation(() => {});
    setup({ token: 'abc123' });
    expect(spy).toHaveBeenCalledWith('abc123');
  });

  it('navigates to /login with error when no token param', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    setup({});
    expect(spy).toHaveBeenCalledWith(['/login'], { queryParams: { error: 'auth_failed' } });
  });

  it('navigates to /login with error when error param is present', () => {
    const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    setup({ token: 'abc123', error: 'access_denied' });
    expect(spy).toHaveBeenCalledWith(['/login'], { queryParams: { error: 'auth_failed' } });
  });
});
