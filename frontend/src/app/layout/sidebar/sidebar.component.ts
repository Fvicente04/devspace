import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6z' },
  { label: 'GitHub', path: '/dashboard', icon: 'M8 19c-4 1-4-2-6-2m12 4v-3c0-1 0-2-1-2 3 0 6-1 6-7 0-2-1-3-2-4 0-1 0-2-1-3 0 0-1 0-3 1-2-1-4-1-6 0-2-1-3-1-3-1-1 1-1 2-1 3-1 1-2 2-2 4 0 6 3 7 6 7-1 0-1 1-1 2v3' },
  { label: 'Pomodoro', path: '/dashboard', icon: 'M12 8v5l3 3m5-4a8 8 0 1 1-16 0 8 8 0 0 1 16 0z' },
  { label: 'Tasks', path: '/dashboard', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { label: 'Notes', path: '/dashboard', icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  nav = navItems;
  displayName = computed(() => {
    const user = this.auth.currentUser();
    return user?.displayName || user?.username || (this.auth.isAuthenticated() ? 'Developer' : 'Guest');
  });
  handle = computed(() => {
    const user = this.auth.currentUser();
    return user ? `@${user.username}` : '@github';
  });
  initials = computed(() => this.displayName().slice(0, 2).toUpperCase());

  ngOnInit() {
    void this.auth.loadCurrentUser();
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  logout() {
    this.auth.logout();
  }
}
