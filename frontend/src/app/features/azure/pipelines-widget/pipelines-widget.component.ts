import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CardComponent } from '../../../shared/card/card.component';
import { AzurePipeline } from '../azure.models';
import { AzureService } from '../azure.service';

function pipelineStatusClass(pipeline: AzurePipeline): string {
  if (pipeline.status === 'inProgress') return 'dot-yellow';
  if (pipeline.result === 'succeeded') return 'dot-green';
  if (pipeline.result === 'failed') return 'dot-red';
  return 'dot-gray';
}

@Component({
  selector: 'app-pipelines-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, RouterLink],
  template: `
    <app-card title="Pipelines" dotColor="var(--blue)">
      @if (!azureConnected()) {
        <div class="not-connected">
          <a routerLink="/settings">Connect Azure DevOps</a> to see pipelines
        </div>
      } @else if (loading()) {
        <div data-testid="loading" class="loading-row">Loading...</div>
      } @else if (pipelines().length === 0) {
        <div class="empty-state">No recent pipeline runs</div>
      } @else {
        @for (p of pipelines(); track p.id) {
          <div data-testid="pipeline" class="pipeline-item">
            <span [attr.data-testid]="'status-dot-' + p.id" class="status-dot" [class]="statusClass(p)"></span>
            <a [href]="p.url" target="_blank" rel="noopener" class="pipeline-name">{{ p.name }}</a>
            <span class="pipeline-result">{{ p.result ?? p.status }}</span>
          </div>
        }
      }
    </app-card>
  `,
  styles: [`
    .pipeline-item { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
    .pipeline-item:last-child { border-bottom: none; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-green { background: var(--green); }
    .dot-red { background: var(--red); }
    .dot-yellow { background: var(--yellow); }
    .dot-gray { background: var(--text-dim); }
    .pipeline-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pipeline-name:hover { color: var(--accent-bright); }
    .pipeline-result { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-muted); }
    .not-connected, .loading-row, .empty-state { font-size: 12px; color: var(--text-muted); padding: 12px 0; }
    .not-connected a { color: var(--accent); }
  `],
})
export class PipelinesWidgetComponent implements OnInit {
  private service = inject(AzureService);

  azureConnected = input<boolean>(false);
  pipelines = signal<AzurePipeline[]>([]);
  loading = signal(false);

  readonly statusClass = pipelineStatusClass;

  async ngOnInit() {
    if (!this.azureConnected()) return;
    this.loading.set(true);
    const all = await firstValueFrom(this.service.getPipelines());
    this.pipelines.set(all.slice(0, 5));
    this.loading.set(false);
  }
}
