// Activity widget — displays last 5 GitHub events for the authenticated user
import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GithubService } from '../github.service';
import { ActivityEvent } from '../github.models';
import { CardComponent } from '../../../shared/card/card.component';

@Component({
  selector: 'app-activity-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <app-card title="Activity" dotColor="var(--blue)">
      @if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (events().length === 0) {
        <div class="empty-state">No recent activity</div>
      } @else {
        @for (event of events(); track event.id) {
          <div data-testid="activity-item" class="gh-item">
            <div data-testid="activity-icon" class="activity-icon" [class]="event.type"></div>
            <div class="gh-item-content">
              <span class="gh-title">{{ event.description }}</span>
              <span class="gh-meta">{{ event.repo }}</span>
            </div>
          </div>
        }
      }
    </app-card>
  `,
  styles: [`
    .activity-icon { width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0; }
    .activity-icon.push { background: var(--blue-dim); }
    .activity-icon.pr { background: var(--green-dim); }
    .activity-icon.issue { background: var(--red-dim); }
    .activity-icon.other { background: var(--bg-hover); }
    .gh-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
    .gh-item:last-child { border-bottom: none; }
    .gh-item-content { flex: 1; min-width: 0; }
    .gh-title { display: block; font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gh-meta { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-muted); }
    .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
  `],
})
export class ActivityWidgetComponent implements OnInit {
  private service = inject(GithubService);

  events = signal<ActivityEvent[]>([]);
  loading = signal(true);

  async ngOnInit() {
    const all = await firstValueFrom(this.service.getActivity());
    this.events.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
