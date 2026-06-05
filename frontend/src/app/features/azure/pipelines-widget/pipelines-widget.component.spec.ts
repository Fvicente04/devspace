// Tests for PipelinesWidgetComponent — connected/disconnected states, status display
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, NEVER } from 'rxjs';

import { PipelinesWidgetComponent } from './pipelines-widget.component';
import { AzureService } from '../azure.service';
import { AzurePipeline } from '../azure.models';

const mockPipelines: AzurePipeline[] = [
  { id: 1, name: 'CI Build', status: 'completed', result: 'succeeded', url: 'https://dev.azure.com/run/1', finishedAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Deploy Prod', status: 'completed', result: 'failed', url: 'https://dev.azure.com/run/2', finishedAt: '2024-01-02T00:00:00Z' },
  { id: 3, name: 'Nightly', status: 'inProgress', result: null, url: 'https://dev.azure.com/run/3', finishedAt: null },
  { id: 4, name: 'Cleanup', status: 'completed', result: 'canceled', url: 'https://dev.azure.com/run/4', finishedAt: '2024-01-03T00:00:00Z' },
];

describe('PipelinesWidgetComponent', () => {
  let fixture: ComponentFixture<PipelinesWidgetComponent>;
  let azureService: { getPipelines: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    azureService = { getPipelines: vi.fn().mockReturnValue(of(mockPipelines)) };

    await TestBed.configureTestingModule({
      imports: [PipelinesWidgetComponent],
      providers: [
        provideRouter([{ path: 'settings', component: {} as any }]),
        { provide: AzureService, useValue: azureService },
      ],
    }).compileComponents();
  });

  async function create(connected = true) {
    fixture = TestBed.createComponent(PipelinesWidgetComponent);
    fixture.componentRef.setInput('azureConnected', connected);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe('when connected', () => {
    it('calls getPipelines on init', async () => {
      await create(true);
      expect(azureService.getPipelines).toHaveBeenCalled();
    });

    it('displays list of pipelines', async () => {
      await create(true);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="pipeline"]').length).toBe(4);
    });

    it('each pipeline shows name and links to url', async () => {
      await create(true);
      const item = fixture.nativeElement.querySelector('[data-testid="pipeline"]');
      expect(item.textContent).toContain('CI Build');
      expect(item.querySelector('a').getAttribute('href')).toBe('https://dev.azure.com/run/1');
    });

    it('shows loading state while fetching', async () => {
      azureService.getPipelines.mockReturnValue(NEVER);
      fixture = TestBed.createComponent(PipelinesWidgetComponent);
      fixture.componentRef.setInput('azureConnected', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
    });

    it('shows empty state when no pipelines', async () => {
      azureService.getPipelines.mockReturnValue(of([]));
      await create(true);
      expect(fixture.nativeElement.textContent).toContain('No recent pipeline runs');
    });

    it('succeeded result shows green dot', async () => {
      await create(true);
      const dot = fixture.nativeElement.querySelector('[data-testid="status-dot-1"]');
      expect(dot.classList).toContain('dot-green');
    });

    it('failed result shows red dot', async () => {
      await create(true);
      const dot = fixture.nativeElement.querySelector('[data-testid="status-dot-2"]');
      expect(dot.classList).toContain('dot-red');
    });

    it('inProgress status shows yellow dot', async () => {
      await create(true);
      const dot = fixture.nativeElement.querySelector('[data-testid="status-dot-3"]');
      expect(dot.classList).toContain('dot-yellow');
    });

    it('canceled result shows gray dot', async () => {
      await create(true);
      const dot = fixture.nativeElement.querySelector('[data-testid="status-dot-4"]');
      expect(dot.classList).toContain('dot-gray');
    });
  });

  describe('when not connected', () => {
    it('does not call getPipelines', async () => {
      await create(false);
      expect(azureService.getPipelines).not.toHaveBeenCalled();
    });

    it('shows "Connect Azure DevOps" placeholder with link to /settings', async () => {
      await create(false);
      expect(fixture.nativeElement.textContent).toContain('Connect Azure DevOps');
      expect(fixture.nativeElement.querySelector('a[href="/settings"]')).toBeTruthy();
    });
  });
});
