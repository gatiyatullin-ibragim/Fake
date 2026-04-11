import { computed, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, Preferences } from './auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  private auth = inject(AuthService);

  user = this.auth.user;
  preferences = signal<Preferences | null>(null);
  message = signal('');
  loading = signal(true);
  error = signal('');

  preferenceKeys = computed(() => Object.keys(this.preferences() || {}));

  constructor() {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.getPreferences().subscribe({
      next: (response) => {
        this.preferences.set(response.preferences);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Не удалось загрузить предпочтения');
        this.loading.set(false);
      }
    });
  }

  resetPreferences(): void {
    this.message.set('');
    this.error.set('');
    this.auth.resetPreferences().subscribe({
      next: (response) => {
        this.preferences.set(response.preferences);
        this.message.set('История интересов очищена');
      },
      error: (err) => {
        this.error.set(err.message || 'Не удалось очистить историю интересов');
      }
    });
  }
}
