import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { PageHeaderComponent } from '../../layout/page-header/page-header.component';
import { ActivityWidgetComponent } from '../github/activity-widget/activity-widget.component';
import { GithubCardComponent } from '../github/github-card/github-card.component';
import { GithubService } from '../github/github.service';
import { NotesWidgetComponent } from '../notes/notes-widget/notes-widget.component';
import { PomodoroComponent } from '../pomodoro/pomodoro.component';
import { TimerService } from '../pomodoro/timer.service';
import { TasksWidgetComponent } from '../tasks/tasks-widget/tasks-widget.component';
import { PipelinesWidgetComponent } from '../azure/pipelines-widget/pipelines-widget.component';
import { WorkItemsWidgetComponent } from '../azure/workitems-widget/workitems-widget.component';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActivityWidgetComponent,
    GithubCardComponent,
    NotesWidgetComponent,
    PageHeaderComponent,
    PipelinesWidgetComponent,
    PomodoroComponent,
    TasksWidgetComponent,
    WorkItemsWidgetComponent,
  ],
  template: `
    <app-page-header [title]="'Good morning, ' + username()" [subtitle]="headerSubtitle()">
      <button class="btn btn-ghost" type="button" (click)="refresh()">Refresh</button>
      <button class="btn btn-primary" type="button" (click)="openNewTask()">New Task</button>
    </app-page-header>

    <div class="dashboard-grid">
      <app-pomodoro class="pomodoro-card" />
      <app-tasks-widget />
      <app-github-card />
      <app-notes-widget />
      <app-activity-widget class="activity-card" />
      <app-workitems-widget class="workitems-card" [azureConnected]="azureConnected()" />
      <app-pipelines-widget class="pipelines-card" [azureConnected]="azureConnected()" />
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 16px;
    }

    .pomodoro-card {
      grid-column: 1;
      grid-row: 1;
    }

    .activity-card {
      grid-column: 3;
      grid-row: 2;
    }

    .workitems-card {
      grid-column: 1 / 3;
      grid-row: 3;
    }

    .pipelines-card {
      grid-column: 3;
      grid-row: 3;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private github = inject(GithubService);
  private timer = inject(TimerService);
  private settingsService = inject(SettingsService);

  azureConnected = signal(false);

  username = computed(() => {
    const user = this.auth.currentUser();
    return user?.displayName || user?.username || (this.auth.isAuthenticated() ? 'developer' : 'guest');
  });
  todayDate = signal(this.formatToday());
  openPRsCount = signal(0);
  pomodorosToday = signal(0);
  headerSubtitle = computed(
    () => `// ${this.todayDate()} - ${this.openPRsCount()} open PRs - ${this.pomodorosToday()} pomodoros done`
  );

  async ngOnInit() {
    await Promise.all([this.auth.loadCurrentUser(), this.loadSummary(), this.loadAzureSettings()]);
  }

  async refresh() {
    await Promise.all([this.loadSummary(), this.loadAzureSettings()]);
  }

  private async loadAzureSettings() {
    const settings = await firstValueFrom(this.settingsService.getAzureSettings());
    this.azureConnected.set(settings.connected);
  }

  openNewTask() {
    window.dispatchEvent(new CustomEvent('devspace:new-task'));
  }

  private async loadSummary() {
    const [prs, stats] = await Promise.all([
      firstValueFrom(this.github.getPullRequests()),
      firstValueFrom(this.timer.getTodayStats()),
    ]);
    this.openPRsCount.set(prs.length);
    this.pomodorosToday.set(stats.completedSessions);
  }

  private formatToday(): string {
    return new Date()
      .toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit',
      })
      .toLowerCase();
  }
}
