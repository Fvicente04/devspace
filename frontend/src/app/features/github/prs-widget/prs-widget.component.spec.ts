// Tests for PrsWidgetComponent — loading, empty, and data states
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, NEVER } from 'rxjs';

import { PrsWidgetComponent } from './prs-widget.component';
import { GithubService } from '../github.service';
import { ENVIRONMENT } from '../../../core/environment.token';
import { PullRequest } from '../github.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

const mockPRs: PullRequest[] = [
  { id: 1, title: 'Fix auth bug', url: 'https://github.com/o/r/pull/1', repo: 'o/r', status: 'open', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Add feature', url: 'https://github.com/o/r/pull/2', repo: 'o/r', status: 'review', createdAt: '2024-01-02T00:00:00Z' },
];

describe('PrsWidgetComponent', () => {
  let fixture: ComponentFixture<PrsWidgetComponent>;
  let githubService: GithubService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrsWidgetComponent],
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
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(NEVER);
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
  });

  it('displays list of PRs after loading', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of(mockPRs));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[data-testid="pr-item"]');
    expect(items.length).toBe(2);
  });

  it('shows "No open PRs" when list is empty', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of([]));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No open PRs');
  });

  it('displays PR title and repo', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of(mockPRs));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('[data-testid="pr-item"]');
    expect(item.textContent).toContain('Fix auth bug');
    expect(item.textContent).toContain('o/r');
  });

  it('PR title links to the PR url', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of(mockPRs));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[data-testid="pr-item"] a');
    expect(link.getAttribute('href')).toBe('https://github.com/o/r/pull/1');
  });

  it('shows green badge for open status', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of([mockPRs[0]]));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('[data-testid="status-badge"]');
    expect(badge.classList).toContain('status-open');
  });

  it('shows yellow badge for review status', async () => {
    vi.spyOn(githubService, 'getPullRequests').mockReturnValue(of([mockPRs[1]]));
    fixture = TestBed.createComponent(PrsWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('[data-testid="status-badge"]');
    expect(badge.classList).toContain('status-review');
  });
});
