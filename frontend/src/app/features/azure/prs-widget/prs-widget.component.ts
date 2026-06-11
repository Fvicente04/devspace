import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CardComponent } from '../../../shared/card/card.component';
import { AzurePullRequest } from '../azure.models';
import { AzureService } from '../azure.service';

@Component({
  selector: 'app-azure-prs-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, RouterLink],
  template: `
    <app-card title="Azure PRs" dotColor="var(--blue)">
      @if (!azureConnected()) {
        <div class="not-connected">
          <a routerLink="/settings">Connect Azure DevOps</a> to see pull requests
        </div>
      } @else if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (prs().length === 0) {
        <div class="empty-state">No open PRs</div>
      } @else {
        @for (pr of prs(); track pr.id) {
          <div data-testid="azure-pr" class="pr-item">
            <div class="pr-content">
              <a [href]="pr.url" target="_blank" rel="noopener" class="pr-title">{{ pr.title }}</a>
              <span class="pr-meta">{{ pr.repo }}</span>
            </div>
            <span data-testid="status-badge" class="status-badge" [class]="'status-' + pr.status">
              {{ pr.status }}
            </span>
          </div>
        }
      }
    </app-card>
  `,
  styles: [`
    .pr-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
    .pr-item:last-child { border-bottom: none; }
    .pr-content { flex: 1; min-width: 0; }
    .pr-title { display: block; font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pr-title:hover { color: var(--accent-bright); }
    .pr-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-muted); }
    .status-badge { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    .status-active { background: var(--green-dim); color: var(--green); }
    .not-connected, .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
    .not-connected a { color: var(--accent); }
  `],
})
export class AzurePrsWidgetComponent {
  private service = inject(AzureService);

  azureConnected = input<boolean>(false);
  prs = signal<AzurePullRequest[]>([]);
  loading = signal(false);
  private fetched = false;

  constructor() {
    // azureConnected arrives async from the dashboard, so fetch when it flips
    // true rather than reading it once at init
    effect(() => {
      if (this.azureConnected() && !this.fetched) {
        this.fetched = true;
        this.load();
      }
    });
  }

  private async load() {
    this.loading.set(true);
    const all = await firstValueFrom(this.service.getPullRequests());
    this.prs.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
