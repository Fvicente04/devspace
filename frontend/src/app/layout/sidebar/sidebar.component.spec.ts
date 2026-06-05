// Tests for SidebarComponent — logout button renders and calls auth.logout()
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { AuthService } from '../../core/auth.service';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: {
    logout: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof signal>;
    loadCurrentUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      logout: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(true),
      currentUser: signal({ id: 1, username: 'patri', displayName: 'Patri', avatarUrl: null }),
      loadCurrentUser: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
  });

  it('renders a Settings nav item', () => {
    const items = fixture.nativeElement.querySelectorAll('.nav-item');
    const labels = Array.from(items).map((el: any) => el.textContent.trim());
    expect(labels).toContain('Settings');
  });

  it('Settings nav item links to /settings', () => {
    const items: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.nav-item');
    const settingsItem = Array.from(items).find((el) => el.textContent.includes('Settings'));
    expect(settingsItem?.getAttribute('href')).toBe('/settings');
  });

  it('renders the logout button', () => {
    const btn = fixture.nativeElement.querySelector('[data-testid="logout-btn"]');
    expect(btn).toBeTruthy();
  });

  it('calls auth.logout() when the logout button is clicked', () => {
    fixture.nativeElement.querySelector('[data-testid="logout-btn"]').click();
    expect(authService.logout).toHaveBeenCalled();
  });
});
