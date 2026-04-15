import { computed, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, Preferences } from './auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  savingProfile = signal(false);
  address = '';
  email = '';

  preferenceKeys = computed(() => Object.keys(this.preferences() || {}));

  constructor() {
    this.syncProfileFields();
    this.loadPreferences();
  }

  private syncProfileFields(): void {
    this.email = this.user()?.email || '';
    this.address = this.user()?.address || '';
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

  saveProfile(): void {
    this.message.set('');
    this.error.set('');
    this.savingProfile.set(true);
    this.auth.updateProfile({ email: this.email.trim(), address: this.address.trim() }).subscribe({
      next: () => {
        this.syncProfileFields();
        this.message.set('Профиль обновлен');
        this.savingProfile.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Не удалось обновить профиль');
        this.savingProfile.set(false);
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
