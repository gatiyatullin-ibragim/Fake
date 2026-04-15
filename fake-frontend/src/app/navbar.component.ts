import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  isLoggedIn = computed(() => !!this.user());
  searchQuery = '';

  submitSearch(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/catalog'], {
      queryParams: query ? { q: query } : {},
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {}
    });
  }
}
