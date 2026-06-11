// Tests for AzurePrsWidgetComponent — connected/disconnected states, PR list display
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, NEVER } from 'rxjs';

import { AzurePrsWidgetComponent } from './prs-widget.component';
import { AzureService } from '../azure.service';
import { AzurePullRequest } from '../azure.models';

const mockPrs: AzurePullRequest[] = [
  { id: 10, title: 'Add login form', repo: 'webapp', status: 'active', url: 'https://dev.azure.com/org/proj/_git/webapp/pullrequest/10', createdAt: '2024-01-02T00:00:00Z' },
  { id: 11, title: 'Fix timer drift', repo: 'webapp', status: 'active', url: 'https://dev.azure.com/org/proj/_git/webapp/pullrequest/11', createdAt: '2024-01-01T00:00:00Z' },
];

describe('AzurePrsWidgetComponent', () => {
  let fixture: ComponentFixture<AzurePrsWidgetComponent>;
  let azureService: { getPullRequests: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    azureService = { getPullRequests: vi.fn().mockReturnValue(of(mockPrs)) };

    await TestBed.configureTestingModule({
      imports: [AzurePrsWidgetComponent],
      providers: [
        provideRouter([{ path: 'settings', component: {} as any }]),
        { provide: AzureService, useValue: azureService },
      ],
    }).compileComponents();
  });

  async function create(connected = true) {
    fixture = TestBed.createComponent(AzurePrsWidgetComponent);
    fixture.componentRef.setInput('azureConnected', connected);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe('when connected', () => {
    it('calls getPullRequests on init', async () => {
      await create(true);
      expect(azureService.getPullRequests).toHaveBeenCalled();
    });

    it('displays the list of PRs', async () => {
      await create(true);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="azure-pr"]').length).toBe(2);
    });

    it('each PR shows title, repo and links to the PR url', async () => {
      await create(true);
      const item = fixture.nativeElement.querySelector('[data-testid="azure-pr"]');
      expect(item.textContent).toContain('Add login form');
      expect(item.textContent).toContain('webapp');
      expect(item.querySelector('a').getAttribute('href')).toBe(
        'https://dev.azure.com/org/proj/_git/webapp/pullrequest/10'
      );
    });

    it('shows at most 5 PRs', async () => {
      const many = Array.from({ length: 8 }, (_, i) => ({ ...mockPrs[0], id: i }));
      azureService.getPullRequests.mockReturnValue(of(many));
      await create(true);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="azure-pr"]').length).toBe(5);
    });

    it('shows loading state while fetching', async () => {
      azureService.getPullRequests.mockReturnValue(NEVER);
      fixture = TestBed.createComponent(AzurePrsWidgetComponent);
      fixture.componentRef.setInput('azureConnected', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
    });

    it('shows empty state when there are no PRs', async () => {
      azureService.getPullRequests.mockReturnValue(of([]));
      await create(true);
      expect(fixture.nativeElement.textContent).toContain('No open PRs');
    });
  });

  describe('when not connected', () => {
    it('does not call getPullRequests', async () => {
      await create(false);
      expect(azureService.getPullRequests).not.toHaveBeenCalled();
    });

    it('shows "Connect Azure DevOps" placeholder with link to /settings', async () => {
      await create(false);
      expect(fixture.nativeElement.textContent).toContain('Connect Azure DevOps');
      expect(fixture.nativeElement.querySelector('a[href="/settings"]')).toBeTruthy();
    });
  });
});
