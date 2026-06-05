// Tests for WorkItemsWidgetComponent — connected/disconnected states, badges, data display
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, NEVER } from 'rxjs';

import { WorkItemsWidgetComponent } from './workitems-widget.component';
import { AzureService } from '../azure.service';
import { AzureWorkItem } from '../azure.models';

const mockItems: AzureWorkItem[] = [
  { id: 1, title: 'Fix login bug', type: 'Bug', state: 'Active', url: 'https://dev.azure.com/item/1' },
  { id: 2, title: 'Add dark mode', type: 'User Story', state: 'Resolved', url: 'https://dev.azure.com/item/2' },
  { id: 3, title: 'Write tests', type: 'Task', state: 'Closed', url: 'https://dev.azure.com/item/3' },
];

describe('WorkItemsWidgetComponent', () => {
  let fixture: ComponentFixture<WorkItemsWidgetComponent>;
  let azureService: { getWorkItems: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    azureService = { getWorkItems: vi.fn().mockReturnValue(of(mockItems)) };

    await TestBed.configureTestingModule({
      imports: [WorkItemsWidgetComponent],
      providers: [
        provideRouter([{ path: 'settings', component: {} as any }]),
        { provide: AzureService, useValue: azureService },
      ],
    }).compileComponents();
  });

  async function create(connected = true) {
    fixture = TestBed.createComponent(WorkItemsWidgetComponent);
    fixture.componentRef.setInput('azureConnected', connected);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  describe('when Azure is connected', () => {
    it('calls getWorkItems on init', async () => {
      await create(true);
      expect(azureService.getWorkItems).toHaveBeenCalled();
    });

    it('displays list of work items', async () => {
      await create(true);
      expect(fixture.nativeElement.querySelectorAll('[data-testid="workitem"]').length).toBe(3);
    });

    it('each item shows title and links to url', async () => {
      await create(true);
      const item = fixture.nativeElement.querySelector('[data-testid="workitem"]');
      expect(item.textContent).toContain('Fix login bug');
      const link = item.querySelector('a');
      expect(link.getAttribute('href')).toBe('https://dev.azure.com/item/1');
    });

    it('shows loading state while fetching', async () => {
      azureService.getWorkItems.mockReturnValue(NEVER);
      fixture = TestBed.createComponent(WorkItemsWidgetComponent);
      fixture.componentRef.setInput('azureConnected', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="loading"]')).toBeTruthy();
    });

    it('shows empty state when no work items', async () => {
      azureService.getWorkItems.mockReturnValue(of([]));
      await create(true);
      expect(fixture.nativeElement.textContent).toContain('No assigned work items');
    });

    it('Bug type badge has red class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="type-badge-1"]');
      expect(badge.classList).toContain('type-bug');
    });

    it('Task type badge has blue class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="type-badge-3"]');
      expect(badge.classList).toContain('type-task');
    });

    it('User Story type badge has accent class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="type-badge-2"]');
      expect(badge.classList).toContain('type-story');
    });

    it('Active state badge has yellow class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="state-badge-1"]');
      expect(badge.classList).toContain('state-active');
    });

    it('Resolved state badge has green class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="state-badge-2"]');
      expect(badge.classList).toContain('state-done');
    });

    it('Closed state badge has green class', async () => {
      await create(true);
      const badge = fixture.nativeElement.querySelector('[data-testid="state-badge-3"]');
      expect(badge.classList).toContain('state-done');
    });
  });

  describe('when Azure is NOT connected', () => {
    it('does not call getWorkItems', async () => {
      await create(false);
      expect(azureService.getWorkItems).not.toHaveBeenCalled();
    });

    it('shows "Connect Azure DevOps" placeholder with link to /settings', async () => {
      await create(false);
      expect(fixture.nativeElement.textContent).toContain('Connect Azure DevOps');
      const link = fixture.nativeElement.querySelector('a[href="/settings"]');
      expect(link).toBeTruthy();
    });
  });
});
