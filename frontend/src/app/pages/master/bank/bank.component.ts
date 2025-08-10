import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { BankService } from "./bank.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { BankFormDialogComponent } from "./bank-form-dialog.component";

@Component({
  selector: "app-bank",
  templateUrl: "./bank.component.html",
  styleUrls: ["./bank.component.scss"],
})
export class BankComponent implements OnInit {
  banks: any[] = [];
  filteredBanks: any[] = [];
  paginatedBanks: any[] = [];

  searchTerm: string = "";
  sortField: string = "nama_bank";
  sortDirection: "asc" | "desc" = "asc";

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  isRefreshing: boolean = false;

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private bankService: BankService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isRefreshing = true;
    this.bankService.getAll().subscribe({
      next: (data) => {
        this.banks = data;
        this.isRefreshing = false;
        this.applyFilterSort();
      },
      error: () => {
        this.toastrService.danger("Gagal mengambil data");
        this.isRefreshing = false;
      },
    });
  }

  applyFilterSort(): void {
    // Filter
    const term = this.searchTerm.toLowerCase();
    this.filteredBanks = this.banks.filter((b) =>
      [b.nama_bank, b.nama_pemilik, b.no_rekening, b.kode_akun, b.nama_akun]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );

    // Sort
    this.filteredBanks.sort((a, b) => {
      const valueA = (a[this.sortField] || "").toLowerCase();
      const valueB = (b[this.sortField] || "").toLowerCase();

      if (valueA < valueB) return this.sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    this.totalPages = Math.ceil(this.filteredBanks.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedBanks = this.filteredBanks.slice(start, end);
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

  openForm(bank?: any): void {
    this.dialogService
      .open(BankFormDialogComponent, {
        context: { bank: bank || null },
      })
      .onClose.subscribe((result) => {
        if (result === "saved") this.loadData();
      });
  }

  deleteBank(id: number): void {
    if (confirm("Yakin ingin menghapus bank ini?")) {
      this.bankService.delete(id).subscribe({
        next: () => {
          this.toastrService.success("Data berhasil dihapus");
          this.loadData();
        },
        error: () => this.toastrService.danger("Gagal menghapus data"),
      });
    }
  }

  refreshData(): void {
    this.loadData();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.toastrService.info("Proses import belum diimplementasikan");
      input.value = ""; // reset file input
    }
  }

  downloadTemplate(): void {
    this.toastrService.info("Fitur download template belum diimplementasikan");
  }
}
