import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-custom-login',
  templateUrl: './custom-login.component.html',
  styleUrls: ['./custom-login.component.scss'],
})
export class CustomLoginComponent {
  user = {
    email: '',
    password: '',
  };

  loading = false;
  errors: string[] = [];
  messages: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  login() {
  this.loading = true;
  this.errors = [];
  this.messages = [];

  this.http.post<any>('http://localhost:8000/api/login', this.user, {
    withCredentials: true,
  }).subscribe({
    next: (res) => {

  localStorage.setItem('access_token', res.access_token);
  localStorage.setItem('user', JSON.stringify(res.user));
  this.messages.push('Login berhasil!');
  setTimeout(() => this.router.navigateByUrl('/pages'), 100);
  this.loading = false;
},

    error: (err) => {
      this.loading = false;
      if (err.status === 401) {
        this.errors.push('Email atau password salah.');
      } else {
        this.errors.push('Anda Belum Terdaftar Harap Registrasi.');
      }
    },
  });
}

}
