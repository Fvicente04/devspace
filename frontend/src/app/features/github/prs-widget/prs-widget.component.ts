// PRs widget — displays up to 5 open pull requests for the authenticated user
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GithubService } from '../github.service';
import { PullRequest } from '../github.models';
import { CardComponent } from '../../../shared/card/card.component';

@Component({
  selector: 'app-prs-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <app-card title="Pull Requests" dotColor="var(--green)">
      @if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (prs().length === 0) {
        <div class="empty-state">No open PRs</div>
      } @else {
        @for (pr of prs(); track pr.id) {
          <div data-testid="pr-item" class="gh-item">
            <div class="gh-item-content">
              <a [href]="pr.url" target="_blank" rel="noopener" class="gh-title">{{ pr.title }}</a>
              <span class="gh-meta">{{ pr.repo }}</span>
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
    .gh-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
    .gh-item:last-child { border-bottom: none; }
    .gh-item-content { flex: 1; min-width: 0; }
    .gh-title { display: block; font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gh-title:hover { color: var(--accent-bright); }
    .gh-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-muted); }
    .status-badge { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    .status-open { background: var(--green-dim); color: var(--green); }
    .status-review { background: var(--yellow-dim); color: var(--yellow); }
    .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
  `],
})
export class PrsWidgetComponent implements OnInit {
  private service = inject(GithubService);

  prs = signal<PullRequest[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const all = await firstValueFrom(this.service.getPullRequests());
    this.prs.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
