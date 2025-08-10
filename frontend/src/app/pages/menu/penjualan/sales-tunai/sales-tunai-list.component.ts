import { Component, OnInit } from "@angular/core";
import {
  SalesTunaiService,
  SalesInvoice,
  SalesTunai,
} from "./sales-tunai.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { SalesTunaiFormDialogComponent } from "./sales-tunai-form-dialog.component";
import {
  MasterDataService,
  Bank,
  CaraBayar,
} from "../../../../@core/services/master-data.service"; // sesuaikan path

@Component({
  selector: "app-sales-tunai-list",
  templateUrl: "./sales-tunai-list.component.html",
})
export class SalesTunaiListComponent implements OnInit {
  invoices: SalesInvoice[] = [];
  filteredInvoices: SalesInvoice[] = [];
  paginatedInvoices: SalesInvoice[] = [];
  pembayaranTunai: { [invoiceId: number]: SalesTunai[] } = {};

  banks: Bank[] = [];
  caraBayarList: CaraBayar[] = [];

  loading = false;

  searchTerm: string = "";
  fromDate?: Date;
  toDate?: Date;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private salesTunaiService: SalesTunaiService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();

    this.masterDataService.getBanks().subscribe({
      next: (data) => (this.banks = data),
      error: () => this.toastr.danger("Gagal memuat data bank"),
    });

    this.masterDataService.getCaraBayar().subscribe({
      next: (data) => (this.caraBayarList = data),
      error: () => this.toastr.danger("Gagal memuat data cara bayar"),
    });
  }

  get showPaymentColumns(): boolean {
    return this.invoices.some(
      (inv) => (this.pembayaranTunai[inv.id]?.length ?? 0) > 0
    );
  }

  loadInvoices() {
    this.loading = true;
    this.salesTunaiService.getSalesInvoiceTunai().subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilter();
        this.loadPembayaranForInvoices();
      },
      error: () => {
        this.toastr.danger("Gagal memuat data faktur");
        this.loading = false;
      },
    });
  }

  loadPembayaranForInvoices() {
    let completedRequests = 0;
    this.pembayaranTunai = {};

    if (this.invoices.length === 0) {
      this.loading = false;
      return;
    }

    this.invoices.forEach((inv) => {
      this.salesTunaiService.getPembayaranTunaiByInvoice(inv.id).subscribe({
        next: (pembayaran) => {
          this.pembayaranTunai[inv.id] = pembayaran;
          completedRequests++;
          if (completedRequests === this.invoices.length) {
            this.loading = false;
          }
        },
        error: () => {
          this.pembayaranTunai[inv.id] = [];
          completedRequests++;
          if (completedRequests === this.invoices.length) {
            this.loading = false;
          }
        },
      });
    });
  }

  getSudahDibayar(inv: any): number {
    if (!this.pembayaranTunai[inv.id]) return 0;
    return this.pembayaranTunai[inv.id].reduce(
      (sum, p) => sum + (p.jumlah_bayar || 0),
      0
    );
  }

  sudahLunas(inv: SalesInvoice): boolean {
    return inv.status === "lunas" || this.getSudahDibayar(inv) >= inv.total;
  }

  openBayarDialog(inv: SalesInvoice) {
    this.dialogService
      .open(SalesTunaiFormDialogComponent, {
        context: {
          invoice: { ...inv },
          banks: this.banks,
          caraBayarList: this.caraBayarList,
        },
      })
      .onClose.subscribe((result) => {
        if (result === "success") {
          this.loadInvoices();
        }
      });
  }

  cancelBayar(pembayaran: SalesTunai, invoice: SalesInvoice) {
    if (confirm("Batalkan pembayaran tunai ini?")) {
      this.salesTunaiService.cancelBayar(pembayaran.id).subscribe({
        next: () => {
          this.toastr.success("Pembayaran dibatalkan");
          this.loadInvoices();
        },
        error: () => {
          this.toastr.danger("Gagal membatalkan pembayaran");
        },
      });
    }
  }

  cetakStruk(pembayaran: SalesTunai) {
    alert("Fitur cetak struk belum diimplementasikan");
  }

  applyFilter() {
    this.filteredInvoices = this.invoices.filter((inv) => {
      const isTunai = inv.jenis_pembayaran === "tunai";

      const matchNomor = inv.nomor_invoice
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchFromDate = this.fromDate
        ? new Date(inv.tanggal) >= this.fromDate
        : true;
      const matchToDate = this.toDate
        ? new Date(inv.tanggal) <= this.toDate
        : true;

      return isTunai && matchNomor && matchFromDate && matchToDate;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredInvoices.length / this.itemsPerPage
    );
    this.paginatedInvoices = this.filteredInvoices.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  changeItemsPerPage(value: number) {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.updatePagination();
  }

  changePage(page: number, event: Event) {
    event.preventDefault();
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  openDetailDialog(inv: SalesInvoice) {
    alert("Detail invoice: " + inv.nomor_invoice);
  }
}
