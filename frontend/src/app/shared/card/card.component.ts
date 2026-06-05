import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-title-dot" [style.background]="dotColor()"></div>
          {{ title() }}
        </div>
        @if (actionLabel()) {
          <button class="card-action" type="button" (click)="actionClick.emit()">
            {{ actionLabel() }}
          </button>
        }
      </div>
      <ng-content />
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.15s;
    }

    .card:hover {
      border-color: var(--border-bright);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .card-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-title-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .card-action {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
    }

    .card-action:hover {
      color: var(--accent-bright);
    }
  `],
})
export class CardComponent {
  title = input<string>('');
  dotColor = input<string>('var(--accent)');
  actionLabel = input<string>('');
  actionClick = output<void>();
}
