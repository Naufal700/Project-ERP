import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { SalesQuotationService } from "./sales-quotation.service";
import { SalesQuotationFormComponent } from "./sales-quotation-form.component";
import { SalesQuotationDetailComponent } from "./sales-quotation-detail.component";

@Component({
  selector: "app-sales-quotation",
  templateUrl: "./sales-quotation.component.html",
  styleUrls: ["./sales-quotation.component.scss"],
})
export class SalesQuotationComponent implements OnInit {
  quotationList: any[] = [];
  filteredQuotationList: any[] = [];
  paginatedQuotationList: any[] = [];
  searchTerm = "";
  fromDate: Date | null = null;
  toDate: Date | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  isRefreshing = false;

  constructor(
    private quotationService: SalesQuotationService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations() {
    this.isRefreshing = true;
    this.quotationService.getAll().subscribe({
      next: (res) => {
        this.quotationList = res;
        this.filteredQuotationList = res;
        this.paginate();
      },
      error: () => {
        this.toastrService.danger("Gagal memuat data penawaran", "Error");
      },
      complete: () => {
        this.isRefreshing = false;
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();

    this.filteredQuotationList = this.quotationList.filter((q) => {
      const matchSearch =
        q.nomor_quotation.toLowerCase().includes(term) ||
        q.pelanggan?.nama_pelanggan.toLowerCase().includes(term);

      const quotationDate = new Date(q.tanggal);

      const matchDate =
        (!this.fromDate || quotationDate >= new Date(this.fromDate)) &&
        (!this.toDate || quotationDate <= new Date(this.toDate));

      return matchSearch && matchDate;
    });

    this.currentPage = 1;
    this.paginate();
  }

  paginate() {
    this.totalPages = Math.ceil(
      this.filteredQuotationList.length / this.itemsPerPage
    );
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedQuotationList = this.filteredQuotationList.slice(start, end);
  }

  changePage(page: number, event: Event) {
    event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.paginate();
  }

  openForm(data?: any) {
    this.dialogService
      .open(SalesQuotationFormComponent, {
        context: { data },
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((refresh) => {
        if (refresh) this.loadQuotations();
      });
  }

  openDetailDialog(quotation: any) {
    this.dialogService.open(SalesQuotationDetailComponent, {
      context: { quotation },
      closeOnBackdropClick: true,
    });
  }

  deleteQuotation(id: number) {
    if (confirm("Yakin ingin menghapus penawaran ini?")) {
      this.quotationService.delete(id).subscribe({
        next: () => {
          this.toastrService.success("Penawaran berhasil dihapus", "Sukses");
          this.loadQuotations();
        },
        error: () => {
          this.toastrService.danger("Gagal menghapus penawaran", "Error");
        },
      });
    }
  }
}
