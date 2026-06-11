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
import { AzurePrsWidgetComponent } from '../azure/prs-widget/prs-widget.component';
import { PipelinesWidgetComponent } from '../azure/pipelines-widget/pipelines-widget.component';
import { WorkItemsWidgetComponent } from '../azure/workitems-widget/workitems-widget.component';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActivityWidgetComponent,
    AzurePrsWidgetComponent,
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

    <div class="dashboard">
      <section class="dash-section" id="card-pomodoro">
        <div class="section-label"><span class="dot"></span> focus</div>
        <div class="section-grid focus-grid">
          <app-pomodoro />
          <app-tasks-widget id="card-tasks" />
          <app-notes-widget id="card-notes" />
        </div>
      </section>

      <section class="dash-section" id="card-github">
        <div class="section-label"><span class="dot dot-green"></span> github</div>
        <div class="section-grid github-grid">
          <app-github-card />
          <app-activity-widget />
        </div>
      </section>

      <section class="dash-section" id="card-azure">
        <div class="section-label"><span class="dot dot-blue"></span> azure devops</div>
        <div class="section-grid azure-grid">
          <app-workitems-widget [azureConnected]="azureConnected()" />
          <app-azure-prs-widget [azureConnected]="azureConnected()" />
          <app-pipelines-widget [azureConnected]="azureConnected()" />
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 26px;
    }

    .dash-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-margin-top: 12px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }

    .dot-green { background: var(--green); }
    .dot-blue { background: var(--blue); }

    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      align-items: start;
    }

    .github-grid {
      grid-template-columns: 2fr 1fr;
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
