// Login page — redirects to GitHub OAuth or to dashboard if already authenticated
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-shell">
      <div class="login-card">
        <h1 class="login-title">DevSpace</h1>
        <p class="login-subtitle">// your developer day, in one place</p>
        <button class="btn btn-primary login-btn" type="button" (click)="authService.login()">
          Sign in with GitHub
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .login-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px 36px;
      width: 100%;
      max-width: 360px;
      text-align: center;
    }

    .login-title {
      font-family: 'Syne', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.5px;
    }

    .login-subtitle {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 8px;
      margin-bottom: 28px;
    }

    .login-btn {
      width: 100%;
      padding: 11px 14px;
      font-size: 13px;
    }
  `],
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
