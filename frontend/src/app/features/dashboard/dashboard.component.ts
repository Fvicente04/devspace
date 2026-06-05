// Dashboard — main view with GitHub integration widgets
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PrsWidgetComponent } from '../github/prs-widget/prs-widget.component';
import { IssuesWidgetComponent } from '../github/issues-widget/issues-widget.component';
import { ActivityWidgetComponent } from '../github/activity-widget/activity-widget.component';
import { NotesComponent } from '../notes/notes.component';
import { PomodoroComponent } from '../pomodoro/pomodoro.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrsWidgetComponent, IssuesWidgetComponent, ActivityWidgetComponent, PomodoroComponent, NotesComponent],
  template: `
    <div class="dashboard">
      <app-prs-widget />
      <app-issues-widget />
      <app-activity-widget />
      <app-pomodoro />
      <app-notes />
    </div>
  `,
  styles: [`
    .dashboard {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      padding: 28px 32px;
    }
  `],
})
export class DashboardComponent {}
