// Tests for ActivityWidgetComponent — loading, empty, and data states
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, NEVER } from 'rxjs';

import { ActivityWidgetComponent } from './activity-widget.component';
import { GithubService } from '../github.service';
import { ENVIRONMENT } from '../../../core/environment.token';
import { ActivityEvent } from '../github.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

const mockEvents: ActivityEvent[] = [
  { id: '1', type: 'push', repo: 'o/r', description: 'Pushed 2 commit(s)', createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', type: 'pr', repo: 'o/r', description: 'opened a pull request', createdAt: '2024-01-02T00:00:00Z' },
  { id: '3', type: 'issue', repo: 'o/r2', description: 'opened an issue', createdAt: '2024-01-03T00:00:00Z' },
];

describe('ActivityWidgetComponent', () => {
  let fixture: ComponentFixture<ActivityWidgetComponent>;
  let githubService: GithubService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityWidgetComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: testEnv },
      ],
    }).compileComponents();
    githubService = TestBed.inject(GithubService);
  });

  it('shows loading indicator while request is pending', () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(NEVER);
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
  });

  it('displays up to 5 events after loading', async () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(of(mockEvents));
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[data-testid="activity-item"]');
    expect(items.length).toBe(3);
  });

  it('shows "No recent activity" when list is empty', async () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(of([]));
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No recent activity');
  });

  it('displays description and repo for each event', async () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(of(mockEvents));
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('[data-testid="activity-item"]');
    expect(item.textContent).toContain('Pushed 2 commit(s)');
    expect(item.textContent).toContain('o/r');
  });

  it('applies push class to push type icon', async () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(of([mockEvents[0]]));
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('[data-testid="activity-icon"]');
    expect(icon.classList).toContain('push');
  });

  it('applies pr class to pr type icon', async () => {
    vi.spyOn(githubService, 'getActivity').mockReturnValue(of([mockEvents[1]]));
    fixture = TestBed.createComponent(ActivityWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('[data-testid="activity-icon"]');
    expect(icon.classList).toContain('pr');
  });
});
