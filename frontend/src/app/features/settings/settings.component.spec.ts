// Tests for SettingsComponent — Azure DevOps connect/disconnect UI flows
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import { AzureSettings } from '../azure/azure.models';

const disconnected: AzureSettings = { connected: false, organization: null };
const connected: AzureSettings = { connected: true, organization: 'softworks-workforce' };

describe('SettingsComponent', () => {
  let fixture: ComponentFixture<SettingsComponent>;
  let service: {
    getAzureSettings: ReturnType<typeof vi.fn>;
    saveAzureSettings: ReturnType<typeof vi.fn>;
    removeAzureSettings: ReturnType<typeof vi.fn>;
  };

  async function createComponent() {
    fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    service = {
      getAzureSettings: vi.fn().mockReturnValue(of(disconnected)),
      saveAzureSettings: vi.fn().mockReturnValue(of(connected)),
      removeAzureSettings: vi.fn().mockReturnValue(of(disconnected)),
    };

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideRouter([]),
        { provide: SettingsService, useValue: service },
      ],
    }).compileComponents();
  });

  describe('initial load — not connected', () => {
    it('calls getAzureSettings on init', async () => {
      await createComponent();
      expect(service.getAzureSettings).toHaveBeenCalled();
    });

    it('shows organization input and PAT input after clicking Connect', async () => {
      await createComponent();
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="org-input"]')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('[data-testid="pat-input"]')).toBeTruthy();
    });

    it('shows Connect button', async () => {
      await createComponent();
      expect(fixture.nativeElement.querySelector('[data-testid="connect-btn"]')).toBeTruthy();
    });

    it('does not show Disconnect button', async () => {
      await createComponent();
      expect(fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]')).toBeFalsy();
    });
  });

  describe('initial load — already connected', () => {
    beforeEach(() => {
      service.getAzureSettings.mockReturnValue(of(connected));
    });

    it('shows organization name', async () => {
      await createComponent();
      expect(fixture.nativeElement.textContent).toContain('softworks-workforce');
    });

    it('shows Disconnect button', async () => {
      await createComponent();
      expect(fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]')).toBeTruthy();
    });

    it('does not show PAT input', async () => {
      await createComponent();
      expect(fixture.nativeElement.querySelector('[data-testid="pat-input"]')).toBeFalsy();
    });
  });

  describe('connect flow', () => {
    async function openForm() {
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      fixture.detectChanges();
    }

    it('calls saveAzureSettings with organization and patToken', async () => {
      await createComponent();
      await openForm();
      const orgInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="org-input"]');
      const patInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="pat-input"]');
      orgInput.value = 'softworks-workforce';
      orgInput.dispatchEvent(new Event('input'));
      patInput.value = 'my-pat';
      patInput.dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      await fixture.whenStable();
      expect(service.saveAzureSettings).toHaveBeenCalledWith({ organization: 'softworks-workforce', patToken: 'my-pat' });
    });

    it('shows connected state after successful connect', async () => {
      await createComponent();
      await openForm();
      const orgInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="org-input"]');
      const patInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="pat-input"]');
      orgInput.value = 'softworks-workforce';
      orgInput.dispatchEvent(new Event('input'));
      patInput.value = 'my-pat';
      patInput.dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]')).toBeTruthy();
    });

    it('shows error message if organization is empty', async () => {
      await createComponent();
      await openForm();
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="error-msg"]')).toBeTruthy();
      expect(service.saveAzureSettings).not.toHaveBeenCalled();
    });

    it('shows error message if PAT is empty', async () => {
      await createComponent();
      await openForm();
      const orgInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="org-input"]');
      orgInput.value = 'softworks-workforce';
      orgInput.dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="error-msg"]')).toBeTruthy();
      expect(service.saveAzureSettings).not.toHaveBeenCalled();
    });

    it('surfaces the backend error message and stays on the form when save fails', async () => {
      service.saveAzureSettings.mockReturnValue(
        throwError(() => ({ error: { error: 'That looks invalid — use just the organization name (e.g. softworks-workforce), not an email or URL.' } }))
      );
      await createComponent();
      await openForm();
      const orgInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="org-input"]');
      const patInput: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="pat-input"]');
      orgInput.value = 'fvicente@softworks.com';
      orgInput.dispatchEvent(new Event('input'));
      patInput.value = 'my-pat';
      patInput.dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('[data-testid="connect-btn"]').click();
      await fixture.whenStable();
      fixture.detectChanges();
      const errorEl = fixture.nativeElement.querySelector('[data-testid="error-msg"]');
      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('organization name');
      expect(fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]')).toBeFalsy();
    });
  });

  describe('disconnect flow', () => {
    beforeEach(() => {
      service.getAzureSettings.mockReturnValue(of(connected));
    });

    it('calls removeAzureSettings on disconnect', async () => {
      await createComponent();
      fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]').click();
      await fixture.whenStable();
      expect(service.removeAzureSettings).toHaveBeenCalled();
    });

    it('shows disconnected state after disconnect', async () => {
      await createComponent();
      fixture.nativeElement.querySelector('[data-testid="disconnect-btn"]').click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-testid="connect-btn"]')).toBeTruthy();
    });
  });
});
