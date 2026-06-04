// Reads the JWT from the callback URL and delegates to AuthService
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Authenticating...</p>',
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (token && !error) {
      this.authService.handleCallback(token);
    } else {
      this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' } });
    }
  }
}
