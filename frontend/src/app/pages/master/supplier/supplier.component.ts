import { Component, OnInit } from "@angular/core";
import { SupplierService } from "./supplier.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { SupplierFormComponent } from "./supplier-form.component";

@Component({
  selector: "app-supplier",
  templateUrl: "./supplier.component.html",
  styleUrls: ["./supplier.component.scss"],
})
export class SupplierComponent implements OnInit {
  suppliers: any[] = [];
  paginatedSuppliers: any[] = [];

  // Filter, Sort, Pagination
  searchTerm: string = "";
  sortKey: string = "nama_supplier";
  sortAsc: boolean = true;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Refresh indicator
  isRefreshing: boolean = false;

  constructor(
    private supplierService: SupplierService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get sortField(): string {
    return this.sortKey;
  }

  get sortDirection(): "asc" | "desc" {
    return this.sortAsc ? "asc" : "desc";
  }

  /** Ambil semua data supplier */
  loadData(): void {
    this.isRefreshing = true;
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = Array.isArray(data) ? data : [];
        this.isRefreshing = false;
        this.applyFilterSort();
      },
      error: () => {
        this.isRefreshing = false;
        this.toastrService.danger("Gagal memuat data supplier", "Error");
      },
    });
  }

  /** Refresh data manual (sama seperti pelanggan) */
  refreshData(): void {
    this.isRefreshing = true;
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = Array.isArray(data) ? data : [];
        this.currentPage = 1; // reset ke halaman pertama
        this.searchTerm = ""; // reset pencarian jika mau sama persis dengan pelanggan
        this.isRefreshing = false;
        this.applyFilterSort();
        this.toastrService.success(
          "Data supplier berhasil diperbarui",
          "Sukses"
        );
      },
      error: () => {
        this.isRefreshing = false;
        this.toastrService.danger("Gagal memuat data supplier", "Error");
      },
    });
  }

  /** Buka form tambah/edit supplier */
  openForm(data: any = null): void {
    this.dialogService
      .open(SupplierFormComponent, {
        context: { data: data || {}, isEdit: !!(data && data.id) },
        dialogClass: "wide-dialog",
        closeOnBackdropClick: false,
        hasScroll: false,
      })
      .onClose.subscribe((result) => {
        if (result === "success") {
          this.toastrService.success(
            "Data supplier berhasil disimpan",
            "Sukses"
          );
          this.loadData();
        }
      });
  }

  /** Hapus supplier */
  deleteSupplier(id: number): void {
    const confirmed = confirm("Yakin hapus supplier ini?");
    if (!confirmed) return;

    this.supplierService.delete(id).subscribe({
      next: () => {
        this.toastrService.success("Supplier berhasil dihapus", "Sukses");
        this.loadData();
      },
      error: () =>
        this.toastrService.danger("Gagal menghapus supplier", "Error"),
    });
  }

  /** Sorting kolom */
  sortBy(key: string): void {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.applyFilterSort();
  }

  /** Filtering, sorting, pagination */
  applyFilterSort(): void {
    let data = [...this.suppliers];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.nama_supplier?.toLowerCase().includes(term) ||
          s.kode_supplier?.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => {
      const valA = a[this.sortKey]?.toString().toLowerCase() || "";
      const valB = b[this.sortKey]?.toString().toLowerCase() || "";
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    this.totalPages = Math.ceil(data.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedSuppliers = data.slice(start, end);
  }

  changePage(page: number, event?: Event): void {
    if (event) event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterSort();
    }
  }

  /** Trigger file input untuk import Excel */
  triggerFileInput(): void {
    const input = document.querySelector<HTMLInputElement>("input[type=file]");
    input?.click();
  }

  /** Import Excel supplier */
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      this.supplierService.import(formData).subscribe({
        next: () => {
          this.toastrService.success("Berhasil import supplier!", "Sukses");
          this.loadData();
        },
        error: () => this.toastrService.danger("Gagal import file", "Error"),
      });
    }
  }

  /** Download template Excel supplier */
  downloadTemplate(): void {
    this.supplierService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_supplier.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);

        this.toastrService.success(
          "Template supplier berhasil diunduh",
          "Sukses"
        );
      },
      error: () => {
        this.toastrService.danger("Gagal mengunduh template", "Error");
      },
    });
  }
}
