import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { PelangganService } from "./pelanggan.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { PelangganFormDialogComponent } from "./pelanggan-form-dialog.component";

@Component({
  selector: "pelanggan-list",
  templateUrl: "./pelanggan.component.html",
  styleUrls: ["./pelanggan.component.scss"],
})
export class PelangganComponent implements OnInit {
  pelanggans: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];

  searchTerm: string = "";
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  sortField: string = "";
  sortDirection: "asc" | "desc" = "asc";

  isLoading: boolean = false;

  @ViewChild("fileInput", { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private pelangganService: PelangganService,
    private dialogService: NbDialogService,
    private router: Router,
    private toastrService: NbToastrService // ✅ Tambahkan toaster
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Ambil data awal
  loadData() {
    this.isLoading = true;
    this.pelangganService.getAll().subscribe({
      next: (data) => {
        this.pelanggans = data;
        this.isLoading = false;
        this.applyFilterAndSort();
      },
      error: () => {
        this.isLoading = false;
        this.toastrService.danger("Gagal memuat data pelanggan", "Error");
      },
    });
  }

  goToForm() {
    this.dialogService
      .open(PelangganFormDialogComponent)
      .onClose.subscribe((result) => {
        if (result) this.loadData();
      });
  }

  goToEdit(id: number) {
    this.dialogService
      .open(PelangganFormDialogComponent, {
        context: { id },
      })
      .onClose.subscribe((result) => {
        if (result) this.loadData();
      });
  }

  // Hapus data
  delete(id: number) {
    if (confirm("Yakin ingin menghapus data ini?")) {
      this.pelangganService.delete(id).subscribe({
        next: () => {
          this.toastrService.success(
            "Data pelanggan berhasil dihapus",
            "Sukses"
          );
          this.loadData();
        },
        error: () => {
          this.toastrService.danger("Gagal menghapus data pelanggan", "Error");
        },
      });
    }
  }

  // Proses pencarian
  filterData() {
    this.currentPage = 1;
    this.applyFilterAndSort();
  }

  // Filter + Sort + Pagination
  applyFilterAndSort() {
    let data = [...this.pelanggans];

    // Filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.nama_pelanggan?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.telepon?.toLowerCase().includes(term) ||
          p.alamat?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (this.sortField) {
      data.sort((a, b) => {
        const valA = a[this.sortField]?.toLowerCase() || "";
        const valB = b[this.sortField]?.toLowerCase() || "";
        return this.sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    // Pagination
    this.filteredData = data;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.changePage(this.currentPage);
  }

  // Highlight search term
  highlight(text: string): string {
    if (!this.searchTerm) return text;
    const regex = new RegExp(this.searchTerm, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  }

  // Ganti urutan
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
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
      formData.append("file", file);

      this.pelangganService.importExcel(formData).subscribe({
        next: () => {
          this.toastrService.success(
            "Data pelanggan berhasil diimport!",
            "Sukses"
          );
          this.loadData();
        },
        error: (err) => {
          if (err.status === 422 && err.error.errors) {
            this.toastrService.danger(
              "Beberapa data gagal diimport. Periksa format Excel.",
              "Validasi Gagal"
            );
          } else {
            this.toastrService.danger(
              "Gagal mengimpor. Pastikan format file valid.",
              "Error"
            );
          }
        },
      });
    }
  }

  // 🔽 Download template Excel
  downloadTemplate() {
    this.pelangganService.downloadTemplate().subscribe((blob: Blob) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "template_pelanggan.xlsx";
      link.click();
      this.toastrService.success("Template berhasil diunduh", "Sukses");
    });
  }
  isRefreshing: boolean = false;

  refreshData() {
    this.isRefreshing = true;

    this.pelangganService.getAll().subscribe({
      next: (data) => {
        this.pelanggans = data;

        // ✅ Reset filter, sort, dan pagination
        this.searchTerm = "";
        this.sortField = "";
        this.sortDirection = "asc";
        this.currentPage = 1;

        // ✅ Terapkan filter & pagination ulang agar tabel langsung ter-update
        this.applyFilterAndSort();

        this.isRefreshing = false;

        // ✅ Tampilkan toaster sukses
        this.toastrService.success(
          "Data pelanggan berhasil diperbarui",
          "Refresh Berhasil"
        );
      },
      error: () => {
        this.isRefreshing = false;
        this.toastrService.danger("Gagal memuat data pelanggan", "Error");
      },
    });
  }
}
