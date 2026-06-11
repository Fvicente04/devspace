// Tests for SidebarComponent — logout button renders and calls auth.logout()
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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

  it('renders scroll-only nav items (GitHub) as a button, not a link', () => {
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button.nav-item');
    const labels = Array.from(buttons).map((el) => el.textContent?.trim());
    expect(labels).toContain('GitHub');
  });

  it('scrolls to the card when a scroll-only nav item is clicked on the dashboard', () => {
    const el = document.createElement('div');
    const scrollSpy = vi.fn();
    el.scrollIntoView = scrollSpy;
    vi.spyOn(document, 'getElementById').mockReturnValue(el);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/dashboard');

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button.nav-item');
    const github = Array.from(buttons).find((el) => el.textContent?.includes('GitHub'));
    github?.click();

    expect(document.getElementById).toHaveBeenCalledWith('card-github');
    expect(scrollSpy).toHaveBeenCalled();
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
