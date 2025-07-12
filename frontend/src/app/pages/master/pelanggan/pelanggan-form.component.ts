import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PelangganService } from './pelanggan.service';

@Component({
  selector: 'pelanggan-form',
  templateUrl: './pelanggan-form.component.html',
})
export class PelangganFormComponent implements OnInit {
  pelanggan: any = {
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
  };
  id: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private pelangganService: PelangganService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.pelangganService.getById(this.id).subscribe((data) => {
        this.pelanggan = data;
      });
    }
  }

  simpan() {
    if (this.id) {
      this.pelangganService.update(this.id, this.pelanggan).subscribe(() => {
        this.router.navigate(['/pages/master/pelanggan']);
      });
    } else {
      this.pelangganService.create(this.pelanggan).subscribe(() => {
        this.router.navigate(['/pages/master/pelanggan']);
      });
    }
  }
}
