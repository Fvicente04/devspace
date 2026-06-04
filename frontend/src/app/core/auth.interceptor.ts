// Adds Authorization header to all requests targeting the backend API
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ENVIRONMENT } from './environment.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const env = inject(ENVIRONMENT);
  const token = auth.getToken();

  if (token && req.url.startsWith(env.apiUrl)) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
