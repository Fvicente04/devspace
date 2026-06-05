import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CardComponent } from '../../../shared/card/card.component';
import { GithubService } from '../github.service';
import { Issue, PullRequest } from '../github.models';

@Component({
  selector: 'app-github-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <app-card title="GitHub" dotColor="var(--green)">
      @if (loading()) {
        <div class="empty-state">Loading...</div>
      } @else {
        <div class="section-label">pull requests</div>
        @for (pr of prs(); track pr.id) {
          <a class="gh-row" [href]="pr.url" target="_blank" rel="noopener">
            <span>{{ pr.title }}</span>
            <strong>{{ pr.repo }}</strong>
          </a>
        } @empty {
          <div class="empty-state">No open PRs</div>
        }

        <div class="section-label issues-label">issues</div>
        @for (issue of issues(); track issue.id) {
          <a class="gh-row" [href]="issue.url" target="_blank" rel="noopener">
            <span>{{ issue.title }}</span>
            <strong>{{ issue.repo }}</strong>
          </a>
        } @empty {
          <div class="empty-state">No assigned issues</div>
        }
      }
    </app-card>
  `,
  styles: [`
    :host {
      grid-column: 3;
      grid-row: 1;
    }

    .section-label {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .issues-label {
      margin-top: 14px;
    }

    .gh-row {
      display: grid;
      gap: 3px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
    }

    .gh-row span {
      color: var(--text);
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gh-row strong,
    .empty-state {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 400;
    }
  `],
})
export class GithubCardComponent implements OnInit {
  private service = inject(GithubService);

  prs = signal<PullRequest[]>([]);
  issues = signal<Issue[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const [prs, issues] = await Promise.all([
      firstValueFrom(this.service.getPullRequests()),
      firstValueFrom(this.service.getIssues()),
    ]);
    this.prs.set(prs.slice(0, 3));
    this.issues.set(issues.slice(0, 3));
    this.loading.set(false);
  }
}
