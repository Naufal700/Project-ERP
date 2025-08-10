import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { CaraBayarService } from "./cara-bayar.service";
import { CaraBayarFormDialogComponent } from "./cara-bayar-form-dialog.component";
import { CaraBayar } from "./cara-bayar.model";

@Component({
  selector: "app-cara-bayar",
  templateUrl: "./cara-bayar.component.html",
  styleUrls: ["./cara-bayar.component.scss"],
})
export class CaraBayarComponent implements OnInit {
  data: CaraBayar[] = [];
  searchTerm: string = "";
  sortField: string = "nama_cara_bayar";
  sortDirection: "asc" | "desc" = "asc";

  itemsPerPage: number = 10;
  currentPage: number = 1;
  paginatedData: CaraBayar[] = [];
  totalPages: number = 1;
  isRefreshing = false;

  refreshData() {
    this.isRefreshing = true;
    this.loadData();
    setTimeout(() => (this.isRefreshing = false), 1000); // Simulasi loading
  }

  applyFilterSort(): void {
    let filtered = this.data.filter((item) => {
      const term = this.searchTerm.toLowerCase();
      return (
        item.nama_cara_bayar.toLowerCase().includes(term) ||
        item.kode_akun.toLowerCase().includes(term)
      );
    });

    filtered.sort((a, b) => {
      const valA = (a as any)[this.sortField];
      const valB = (b as any)[this.sortField];
      return this.sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = filtered.slice(start, end);
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
    }
    this.applyFilterSort();
  }

  changePage(page: number, event: Event): void {
    event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterSort();
    }
  }

  constructor(
    private caraBayarService: CaraBayarService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.caraBayarService.getAll().subscribe((res) => {
      this.data = res;
      this.applyFilterSort(); // ← WAJIB DITAMBAHKAN!
    });
  }

  openForm(item?: CaraBayar): void {
    this.dialogService
      .open(CaraBayarFormDialogComponent, {
        context: { data: item },
      })
      .onClose.subscribe((res) => {
        if (res) this.loadData();
      });
  }

  delete(id: number): void {
    if (confirm("Yakin ingin menghapus data ini?")) {
      this.caraBayarService.delete(id).subscribe(() => {
        this.toastrService.success("Berhasil dihapus");
        this.loadData();
      });
    }
  }
}
