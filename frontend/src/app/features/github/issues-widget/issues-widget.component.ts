// Issues widget — displays up to 5 open issues assigned to the authenticated user
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GithubService } from '../github.service';
import { Issue } from '../github.models';

@Component({
  selector: 'app-issues-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget-card">
      <div class="card-header">
        <span class="card-title"><span class="dot dot-red"></span>ISSUES</span>
      </div>
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
    </div>
  `,
  styles: [`
    .widget-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: border-color 0.15s linear; }
    .widget-card:hover { border-color: var(--border-bright); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .card-title { font-size: 11px; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; }
    .dot-red { background: var(--red); }
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
