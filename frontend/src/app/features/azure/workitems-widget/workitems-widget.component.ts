import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CardComponent } from '../../../shared/card/card.component';
import { AzureWorkItem } from '../azure.models';
import { AzureService } from '../azure.service';

function typeBadgeClass(type: string): string {
  if (type === 'Bug') return 'type-bug';
  if (type === 'Task') return 'type-task';
  if (type === 'User Story') return 'type-story';
  return 'type-other';
}

function stateBadgeClass(state: string): string {
  if (state === 'Active') return 'state-active';
  if (['Resolved', 'Closed', 'Done'].includes(state)) return 'state-done';
  return 'state-other';
}

@Component({
  selector: 'app-workitems-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, RouterLink],
  template: `
    <app-card title="Work Items" dotColor="var(--blue)">
      @if (!azureConnected()) {
        <div class="not-connected">
          <a routerLink="/settings">Connect Azure DevOps</a> to see work items
        </div>
      } @else if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (items().length === 0) {
        <div class="empty-state">No assigned work items</div>
      } @else {
        @for (item of items(); track item.id) {
          <div data-testid="workitem" class="wi-item">
            <div class="wi-main">
              <a [href]="item.url" target="_blank" rel="noopener" class="wi-title">{{ item.title }}</a>
              <div class="wi-badges">
                <span [attr.data-testid]="'type-badge-' + item.id" class="badge" [class]="typeBadge(item.type)">{{ item.type }}</span>
                <span [attr.data-testid]="'state-badge-' + item.id" class="badge" [class]="stateBadge(item.state)">{{ item.state }}</span>
              </div>
            </div>
          </div>
        }
      }
    </app-card>
  `,
  styles: [`
    .wi-item { padding: 9px 0; border-bottom: 1px solid var(--border); }
    .wi-item:last-child { border-bottom: none; }
    .wi-title { display: block; font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
    .wi-title:hover { color: var(--accent-bright); }
    .wi-badges { display: flex; gap: 5px; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 4px; }
    .type-bug { background: var(--red-dim); color: var(--red); }
    .type-task { background: var(--blue-dim); color: var(--blue); }
    .type-story { background: var(--accent-dim); color: var(--accent-bright); }
    .type-other { background: var(--bg-hover); color: var(--text-muted); }
    .state-active { background: var(--yellow-dim); color: var(--yellow); }
    .state-done { background: var(--green-dim); color: var(--green); }
    .state-other { background: var(--bg-hover); color: var(--text-muted); }
    .not-connected, .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
    .not-connected a { color: var(--accent); }
  `],
})
export class WorkItemsWidgetComponent {
  private service = inject(AzureService);

  azureConnected = input<boolean>(false);
  items = signal<AzureWorkItem[]>([]);
  loading = signal(false);
  private fetched = false;

  readonly typeBadge = typeBadgeClass;
  readonly stateBadge = stateBadgeClass;

  constructor() {
    effect(() => {
      if (this.azureConnected() && !this.fetched) {
        this.fetched = true;
        this.load();
      }
    });
  }

  private async load() {
    this.loading.set(true);
    const all = await firstValueFrom(this.service.getWorkItems());
    this.items.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
