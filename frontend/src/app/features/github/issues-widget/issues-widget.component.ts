// Issues widget — displays up to 5 open issues assigned to the authenticated user
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GithubService } from '../github.service';
import { Issue } from '../github.models';
import { CardComponent } from '../../../shared/card/card.component';

@Component({
  selector: 'app-issues-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <app-card title="Issues" dotColor="var(--red)">
      @if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (issues().length === 0) {
        <div class="empty-state">No assigned issues</div>
      } @else {
        @for (issue of issues(); track issue.id) {
          <div data-testid="issue-item" class="gh-item">
            <div class="gh-item-content">
              <a [href]="issue.url" target="_blank" rel="noopener" class="gh-title">{{ issue.title }}</a>
              <span class="gh-meta">{{ issue.repo }}</span>
            </div>
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
    .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
  `],
})
export class IssuesWidgetComponent implements OnInit {
  private service = inject(GithubService);

  issues = signal<Issue[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const all = await firstValueFrom(this.service.getIssues());
    this.issues.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
