import { Component, OnInit } from "@angular/core";
import { SupplierService } from "./supplier.service";
import { NbDialogService } from "@nebular/theme";
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

  constructor(
    private supplierService: SupplierService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /** Getter untuk digunakan di template */
  get sortField(): string {
    return this.sortKey;
  }

  get sortDirection(): "asc" | "desc" {
    return this.sortAsc ? "asc" : "desc";
  }

  /** Ambil semua data supplier dari backend */
  loadData(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = Array.isArray(data) ? data : [];
        this.applyFilterSort();
      },
      error: (err) => {
        console.error("❌ Gagal memuat data supplier:", err);
      },
    });
  }

  /** Buka popup form untuk tambah/edit supplier */
  openForm(data: any = null): void {
    this.dialogService
      .open(SupplierFormComponent, {
        context: {
          data: data || {},
          isEdit: !!(data && data.id),
        },
        dialogClass: "wide-dialog",
        closeOnBackdropClick: false,
        hasScroll: false,
      })
      .onClose.subscribe((result) => {
        if (result === "success") {
          this.loadData();
        }
      });
  }

  /** Hapus data supplier */
  deleteSupplier(id: number): void {
    const confirmed = confirm("Yakin hapus supplier ini?");
    if (!confirmed) return;

    this.supplierService.delete(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error("❌ Gagal menghapus supplier:", err),
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

    // Filter by nama atau kode
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(
        (s) =>
          s.nama_supplier?.toLowerCase().includes(term) ||
          s.kode_supplier?.toLowerCase().includes(term)
      );
    }

    // Sort by selected key
    data.sort((a, b) => {
      const valA = a[this.sortKey]?.toString().toLowerCase() || "";
      const valB = b[this.sortKey]?.toString().toLowerCase() || "";
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    // Pagination
    this.totalPages = Math.ceil(data.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedSuppliers = data.slice(start, end);
  }

  /** Ubah halaman */
  changePage(page: number, event?: Event): void {
    if (event) event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterSort();
    }
  }

  /** Trigger file input (untuk import Excel) */
  triggerFileInput(): void {
    const input = document.querySelector<HTMLInputElement>("input[type=file]");
    input?.click();
  }

  /** Upload file Excel supplier */
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      this.supplierService.import(formData).subscribe({
        next: () => {
          alert("✅ Berhasil import supplier!");
          this.loadData();
        },
        error: (err) => {
          console.error("❌ Gagal import:", err);
          alert("Gagal import file.");
        },
      });
    }
  }

  /** Unduh template Excel supplier */
  downloadTemplate(): void {
    this.supplierService.downloadTemplate().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_supplier.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
