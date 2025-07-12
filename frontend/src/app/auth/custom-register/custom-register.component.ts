import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-custom-register',
  templateUrl: './custom-register.component.html',
  styleUrls: ['./custom-register.component.scss'],
})
export class CustomRegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  errors: string[] = [];
  messages: string[] = [];
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  register(): void {
    this.errors = [];
    this.messages = [];

    if (!this.user.name || !this.user.email || !this.user.password || !this.user.confirmPassword) {
      this.errors.push('Semua field wajib diisi.');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errors.push('Password dan konfirmasi tidak cocok.');
      return;
    }

    this.loading = true;

    // Ambil CSRF cookie dulu dari Laravel Sanctum
    this.http.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
      withCredentials: true, // sangat penting
    }).subscribe({
      next: () => {
        // Setelah dapat CSRF token, lanjutkan ke register
        this.http.post<any>('http://127.0.0.1:8000/api/register', {
          name: this.user.name,
          email: this.user.email,
          password: this.user.password,
          password_confirmation: this.user.confirmPassword,
        }, {
          withCredentials: true // kirim cookie Laravel
        }).subscribe({
          next: () => {
            this.loading = false;
            this.messages.push('Pendaftaran berhasil! Silakan login.');
            setTimeout(() => this.router.navigateByUrl('/auth/login'), 1500);
          },
          error: (err) => {
            this.loading = false;
            if (err.status === 422 && err.error?.errors) {
              const validationErrors = err.error.errors;
              for (const field in validationErrors) {
                this.errors.push(...validationErrors[field]);
              }
            } else {
              this.errors.push(err.error?.message || 'Terjadi kesalahan.');
            }
          },
        });
      },
      error: () => {
        this.loading = false;
        this.errors.push('Gagal memuat CSRF token.');
      },
    });
  }
}
