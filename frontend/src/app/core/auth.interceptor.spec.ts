// Tests that the auth interceptor adds Authorization header only for apiUrl requests
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { ENVIRONMENT } from './environment.token';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds Authorization header when token exists and URL matches apiUrl', () => {
    localStorage.setItem('devspace_token', 'my_jwt');

    httpClient.get('http://localhost:3000/tasks').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/tasks');

    expect(req.request.headers.get('Authorization')).toBe('Bearer my_jwt');
    req.flush([]);
  });

  it('does not add Authorization header when no token', () => {
    httpClient.get('http://localhost:3000/tasks').subscribe();
    const req = httpMock.expectOne('http://localhost:3000/tasks');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('does not add Authorization header for external domain requests', () => {
    localStorage.setItem('devspace_token', 'my_jwt');

    httpClient.get('https://api.github.com/repos').subscribe();
    const req = httpMock.expectOne('https://api.github.com/repos');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
