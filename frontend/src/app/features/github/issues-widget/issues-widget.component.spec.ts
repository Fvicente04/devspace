// Tests for IssuesWidgetComponent — loading, empty, and data states
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, NEVER } from 'rxjs';

import { IssuesWidgetComponent } from './issues-widget.component';
import { GithubService } from '../github.service';
import { ENVIRONMENT } from '../../../core/environment.token';
import { Issue } from '../github.models';

const testEnv = { apiUrl: 'http://localhost:3000', production: false, githubClientId: '' };

const mockIssues: Issue[] = [
  { id: 1, title: 'Fix login bug', url: 'https://github.com/o/r/issues/1', repo: 'o/r', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Update docs', url: 'https://github.com/o/r/issues/2', repo: 'o/r', createdAt: '2024-01-02T00:00:00Z' },
];

describe('IssuesWidgetComponent', () => {
  let fixture: ComponentFixture<IssuesWidgetComponent>;
  let githubService: GithubService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssuesWidgetComponent],
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
    vi.spyOn(githubService, 'getIssues').mockReturnValue(NEVER);
    fixture = TestBed.createComponent(IssuesWidgetComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
  });

  it('displays list of issues after loading', async () => {
    vi.spyOn(githubService, 'getIssues').mockReturnValue(of(mockIssues));
    fixture = TestBed.createComponent(IssuesWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('[data-testid="issue-item"]');
    expect(items.length).toBe(2);
  });

  it('shows "No assigned issues" when list is empty', async () => {
    vi.spyOn(githubService, 'getIssues').mockReturnValue(of([]));
    fixture = TestBed.createComponent(IssuesWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No assigned issues');
  });

  it('displays issue title and repo', async () => {
    vi.spyOn(githubService, 'getIssues').mockReturnValue(of(mockIssues));
    fixture = TestBed.createComponent(IssuesWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('[data-testid="issue-item"]');
    expect(item.textContent).toContain('Fix login bug');
    expect(item.textContent).toContain('o/r');
  });

  it('issue title links to the issue url', async () => {
    vi.spyOn(githubService, 'getIssues').mockReturnValue(of(mockIssues));
    fixture = TestBed.createComponent(IssuesWidgetComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[data-testid="issue-item"] a');
    expect(link.getAttribute('href')).toBe('https://github.com/o/r/issues/1');
  });
});
