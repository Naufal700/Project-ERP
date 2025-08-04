import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { ProdukService } from "./produk.service";
import { ProdukFormComponent } from "./produk-form..component";

@Component({
  selector: "app-produk",
  templateUrl: "./produk.component.html",
  styleUrls: ["./produk.component.scss"],
})
export class ProdukComponent implements OnInit {
  produkList: any[] = [];
  searchTerm: string = "";

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Refresh indicator
  isRefreshing: boolean = false;

  constructor(
    private produkService: ProdukService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // 🔄 Ambil data produk
  loadData(): void {
    this.isRefreshing = true;
    this.produkService.getAll().subscribe({
      next: (data) => {
        this.produkList = data;
        this.currentPage = 1;
        this.calculateTotalPages();
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data produk", "Error");
      },
    });
  }

  // 🔄 Refresh data manual
  refreshData(): void {
    this.isRefreshing = true;
    this.produkService.getAll().subscribe({
      next: (data) => {
        this.produkList = data;
        this.currentPage = 1;
        this.calculateTotalPages();
        this.isRefreshing = false;
        this.toastr.success("Data produk berhasil diperbarui", "Sukses");
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data produk", "Error");
      },
    });
  }

  // Filter produk
  get filteredProdukList(): any[] {
    const term = this.searchTerm.toLowerCase();

    const filtered = this.produkList.filter(
      (p) =>
        p.nama_produk?.toLowerCase().includes(term) ||
        p.kode_produk?.toLowerCase().includes(term)
    );

    // Urutkan berdasarkan kode produk
    filtered.sort((a, b) => {
      const numA = parseInt(a.kode_produk?.split("-")[1] || "0", 10);
      const numB = parseInt(b.kode_produk?.split("-")[1] || "0", 10);
      return numA - numB;
    });

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  calculateTotalPages(): void {
    const filtered = this.produkList.filter((p) =>
      p.nama_produk?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
  }

  changePage(page: number, event?: Event): void {
    if (event) event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changeItemsPerPage(perPage: number): void {
    this.itemsPerPage = perPage;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  // ➕ Buka form tambah/edit
  openForm(data: any = null): void {
    this.dialogService
      .open(ProdukFormComponent, {
        context: {
          data: data || {},
          isEdit: !!data,
        },
        dialogClass: "wide-dialog",
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((result) => {
        if (result === "success") {
          this.toastr.success("Produk berhasil disimpan", "Sukses");
          this.loadData();
        }
      });
  }

  // 🗑️ Hapus produk
  delete(id: number): void {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      this.produkService.delete(id).subscribe({
        next: () => {
          this.toastr.success("Produk berhasil dihapus", "Sukses");
          this.loadData();
        },
        error: () => this.toastr.danger("Gagal menghapus produk", "Error"),
      });
    }
  }

  // 📥 Import Excel
  triggerFileInput(): void {
    const input = document.querySelector<HTMLInputElement>("input[type=file]");
    input?.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.produkService.importExcel(formData).subscribe({
      next: () => {
        this.toastr.success("Berhasil import produk!", "Sukses");
        this.loadData();
      },
      error: () => this.toastr.danger("Gagal import file produk", "Error"),
    });
  }

  // 📤 Download Template
  downloadTemplate(): void {
    this.produkService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_produk.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success("Template produk berhasil diunduh", "Sukses");
      },
      error: () =>
        this.toastr.danger("Gagal mengunduh template produk", "Error"),
    });
  }
}
