import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private auth = inject(AuthService);

  user = this.auth.user;
  isLoggedIn = computed(() => !!this.user());

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
