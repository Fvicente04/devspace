import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">{{ title() }}</div>
        <div class="page-sub">{{ subtitle() }}</div>
      </div>
      <div class="header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .page-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .page-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  `],
})
export class PageHeaderComponent {
  title = input<string>('');
  subtitle = input<string>('');
}
