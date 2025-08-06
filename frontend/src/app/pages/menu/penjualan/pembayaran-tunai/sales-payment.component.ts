import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { SalesPaymentService } from "./sales-payment.service";
import { SalesPaymentFormDialogComponent } from "./sales-payment-form-dialog.component";

@Component({
  selector: "app-sales-payment",
  templateUrl: "./sales-payment.component.html",
  styleUrls: ["./sales-payment.component.scss"],
})
export class SalesPaymentComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  paginatedPayments: any[] = [];

  searchTerm = "";
  fromDate: string = "";
  toDate: string = "";
  isRefreshing = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private paymentService: SalesPaymentService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments() {
    this.isRefreshing = true;
    this.paymentService.getPayments().subscribe({
      next: (res) => {
        this.payments = res;
        this.applyFilter();
        this.isRefreshing = false;
      },
      error: () => {
        this.toastr.danger("Gagal memuat daftar pembayaran", "Error");
        this.isRefreshing = false;
      },
    });
  }

  applyFilter() {
    this.filteredPayments = this.payments.filter((p) => {
      const matchSearch =
        !this.searchTerm ||
        p.order?.nomor_order
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        p.order?.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchDate =
        (!this.fromDate ||
          new Date(p.tanggal_bayar) >= new Date(this.fromDate)) &&
        (!this.toDate || new Date(p.tanggal_bayar) <= new Date(this.toDate));

      return matchSearch && matchDate;
    });

    this.totalPages = Math.ceil(
      this.filteredPayments.length / this.itemsPerPage
    );
    this.changePage(1);
  }

  changePage(page: number, event?: Event) {
    if (event) event.preventDefault();
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;

    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedPayments = this.filteredPayments.slice(start, end);
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.applyFilter();
  }

  openPaymentDialog() {
    this.dialogService
      .open(SalesPaymentFormDialogComponent)
      .onClose.subscribe((result) => {
        if (result) {
          this.toastr.success("Pembayaran berhasil disimpan", "Sukses");
          this.loadPayments();
        }
      });
  }
}
