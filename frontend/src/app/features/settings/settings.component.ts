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
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <span class="page-subtitle">// manage your integrations</span>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="card-dot"></span>
            INTEGRATIONS
          </div>
        </div>

        <div class="integration-row">
          <div class="integration-label">
            <svg class="integration-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>Azure DevOps</span>
          </div>

          @if (settings().connected) {
            <div class="connected-state">
              <span class="connected-dot"></span>
              <span class="connected-org">{{ settings().organization }}</span>
              <button data-testid="disconnect-btn" class="btn btn-ghost" (click)="disconnect()" [disabled]="loading()">
                Disconnect
              </button>
            </div>
          } @else if (formOpen()) {
            <div class="connect-form">
              <input
                data-testid="org-input"
                type="text"
                placeholder="softworks-workforce"
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
              <span class="help-text">Generate at dev.azure.com → User Settings → Personal Access Tokens</span>
              @if (error()) {
                <div data-testid="error-msg" class="error-msg">{{ error() }}</div>
              }
              <div class="form-actions">
                <button data-testid="connect-btn" class="btn btn-primary" (click)="connect()" [disabled]="loading()">
                  {{ loading() ? 'Connecting...' : 'Connect' }}
                </button>
                <button class="btn btn-ghost" type="button" (click)="formOpen.set(false)">Cancel</button>
              </div>
            </div>
          } @else {
            <button data-testid="connect-btn" class="btn btn-primary" (click)="formOpen.set(true)">
              Connect
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding: 28px 32px; }
    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 22px; font-weight: 800; color: var(--text); margin: 0 0 4px; }
    .page-subtitle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; max-width: 540px; transition: border-color 0.15s; }
    .card:hover { border-color: var(--border-bright); }
    .card-header { margin-bottom: 18px; }
    .card-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .card-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
    .integration-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .integration-label { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; color: var(--text); flex: 1; min-width: 160px; }
    .integration-icon { width: 16px; height: 16px; fill: none; stroke: var(--blue); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
    .connected-state { display: flex; align-items: center; gap: 10px; }
    .connected-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; }
    .connected-org { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); }
    .connect-form { display: grid; gap: 8px; width: 100%; margin-top: 14px; }
    .integration-row:has(.connect-form) { flex-direction: column; align-items: flex-start; }
    input { background: var(--bg); border: 1px solid var(--border-bright); border-radius: 8px; padding: 8px 12px; font-family: 'Syne', sans-serif; font-size: 12px; color: var(--text); width: 100%; box-sizing: border-box; }
    input:focus { border-color: var(--accent); outline: none; }
    input::placeholder { color: var(--text-dim); }
    .help-text { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-dim); }
    .error-msg { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--red); }
    .form-actions { display: flex; gap: 8px; }
    .btn { border-radius: 8px; padding: 8px 16px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; border: none; white-space: nowrap; }
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
  formOpen = signal(false);

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
    try {
      const result = await firstValueFrom(
        this.service.saveAzureSettings({ organization: this.organization(), patToken: this.patToken() })
      );
      this.settings.set(result);
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Could not connect. Check the organization and PAT.');
    } finally {
      this.loading.set(false);
    }
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
