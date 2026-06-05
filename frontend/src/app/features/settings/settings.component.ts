import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AzureSettings } from '../azure/azure.models';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings-page">
      <h1 class="page-title">Settings</h1>

      <div class="section">
        <div class="section-header">
          <span class="section-dot" style="background: var(--blue)"></span>
          <span class="section-title">AZURE DEVOPS</span>
        </div>

        @if (settings().connected) {
          <div class="connected-state">
            <span class="connected-dot"></span>
            <span class="connected-org">{{ settings().organization }}</span>
            <button data-testid="disconnect-btn" class="btn btn-ghost" (click)="disconnect()" [disabled]="loading()">
              Disconnect
            </button>
          </div>
        } @else {
          <div class="connect-form">
            <input
              data-testid="org-input"
              type="text"
              placeholder="Organization (e.g. softworks-workforce)"
              [value]="organization()"
              (input)="organization.set($any($event.target).value)"
            />
            <input
              data-testid="pat-input"
              type="password"
              placeholder="Personal Access Token"
              [value]="patToken()"
              (input)="patToken.set($any($event.target).value)"
            />
            @if (error()) {
              <div data-testid="error-msg" class="error-msg">{{ error() }}</div>
            }
            <button data-testid="connect-btn" class="btn btn-primary" (click)="connect()" [disabled]="loading()">
              {{ loading() ? 'Connecting...' : 'Connect' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding: 28px 32px; }
    .page-title { font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 28px; }
    .section { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; max-width: 480px; }
    .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
    .section-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .connected-state { display: flex; align-items: center; gap: 12px; }
    .connected-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
    .connected-org { font-size: 13px; font-weight: 700; color: var(--text); flex: 1; }
    .connect-form { display: grid; gap: 10px; }
    input { background: var(--bg); border: 1px solid var(--border-bright); border-radius: 8px; padding: 8px 12px; font-family: 'Syne', sans-serif; font-size: 12px; color: var(--text); }
    input:focus { border-color: var(--accent); outline: none; }
    input::placeholder { color: var(--text-dim); }
    .error-msg { font-size: 11px; color: var(--red); font-family: 'JetBrains Mono', monospace; }
    .btn { border-radius: 8px; padding: 8px 16px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-ghost { background: transparent; border: 1px solid var(--border-bright); color: var(--text-muted); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class SettingsComponent implements OnInit {
  private service = inject(SettingsService);

  settings = signal<AzureSettings>({ connected: false, organization: null });
  organization = signal('');
  patToken = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    const result = await firstValueFrom(this.service.getAzureSettings());
    this.settings.set(result);
  }

  async connect() {
    if (!this.organization().trim() || !this.patToken().trim()) {
      this.error.set('Organization and PAT are required');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    const result = await firstValueFrom(
      this.service.saveAzureSettings({ organization: this.organization(), patToken: this.patToken() })
    );
    this.settings.set(result);
    this.loading.set(false);
  }

  async disconnect() {
    this.loading.set(true);
    const result = await firstValueFrom(this.service.removeAzureSettings());
    this.settings.set(result);
    this.organization.set('');
    this.patToken.set('');
    this.loading.set(false);
  }
}
