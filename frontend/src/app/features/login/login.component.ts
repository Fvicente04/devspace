// Login page — redirects to GitHub OAuth or to dashboard if already authenticated
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <h1>DevSpace</h1>
      <button (click)="authService.login()">Sign in with GitHub</button>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
