import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  serverError = signal('');

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    password2: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.serverError.set('Заполните все поля правильно');
      return;
    }

    if (this.form.value.password !== this.form.value.password2) {
      this.serverError.set('Пароли не совпадают');
      return;
    }

    this.serverError.set('');
    const payload = this.form.value as {
      username: string;
      email: string;
      password: string;
      password2: string;
    };

    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => {
        console.error(error);
        this.serverError.set(error?.message || 'Ошибка регистрации. Попробуйте другой логин или email.');
      }
    });
  }
}
