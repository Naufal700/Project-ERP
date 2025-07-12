import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PelangganService } from './pelanggan.service';

@Component({
  selector: 'pelanggan-list',
  templateUrl: './pelanggan.component.html',
  styleUrls: ['./pelanggan.component.scss'],
})
export class PelangganComponent implements OnInit {
  pelanggans: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private pelangganService: PelangganService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Ambil data awal
  loadData() {
    this.pelangganService.getAll().subscribe((data) => {
      this.pelanggans = data;
      this.applyFilterAndSort();
    });
  }

  // Navigasi ke form tambah/edit
  goToForm(id?: number) {
    this.router.navigate(['/pages/master/pelanggan/form', ...(id ? [id] : [])]);
  }

  // Hapus data
  delete(id: number) {
    if (confirm('Yakin ingin menghapus data ini?')) {
      this.pelangganService.delete(id).subscribe(() => this.loadData());
    }
  }

  // Proses pencarian
  filterData() {
    this.applyFilterAndSort();
  }

  // Filter + Sort + Pagination
  applyFilterAndSort() {
    let data = [...this.pelanggans];

    // Filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(p =>
        p.nama?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.telepon?.toLowerCase().includes(term) ||
        p.alamat?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (this.sortField) {
      data.sort((a, b) => {
        const valA = a[this.sortField]?.toLowerCase() || '';
        const valB = b[this.sortField]?.toLowerCase() || '';
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    // Pagination
    this.filteredData = data;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.changePage(this.currentPage);
  }

  // Ganti urutan
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilterAndSort();
  }

  // Navigasi halaman
  changePage(page: number, event?: Event) {
    if (event) event.preventDefault();
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  // Ganti jumlah per halaman
  changeItemsPerPage(newSize: number) {
    this.itemsPerPage = newSize;
    this.currentPage = 1;
    this.applyFilterAndSort();
  }

  // 📥 Import Excel
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.pelangganService.importExcel(formData).subscribe({
        next: () => {
          alert('✅ Import berhasil!');
          this.loadData();
        },
        error: () => alert('❌ Gagal mengimpor. Pastikan format file valid.'),
      });
    }
  }

  // 🔽 Download template Excel
  downloadTemplate() {
    this.pelangganService.downloadTemplate().subscribe((blob: Blob) => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'template_pelanggan.xlsx';
      link.click();
    });
  }
}
