import { Component, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { SalesPaymentService } from "./sales-payment.service";
import { SalesOrderService } from "../sales-order/sales-order.service";

@Component({
  selector: "app-sales-payment-form-dialog",
  templateUrl: "./sales-payment-form-dialog.component.html",
  styleUrls: ["./sales-payment-form-dialog.component.scss"],
})
export class SalesPaymentFormDialogComponent implements OnInit {
  salesOrders: any[] = [];
  paymentForm = {
    id_order: null,
    metode: "tunai",
    jumlah_bayar: 0,
    tanggal_bayar: new Date().toISOString().split("T")[0],
    keterangan: "",
  };
  isLoading = false;

  constructor(
    protected dialogRef: NbDialogRef<SalesPaymentFormDialogComponent>,
    private paymentService: SalesPaymentService,
    private orderService: SalesOrderService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  /** Ambil daftar Sales Order yang approved */
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.salesOrders = orders.filter((o: any) => o.status === "approved");
      },
      error: () => this.toastr.danger("Gagal memuat Sales Order", "Error"),
    });
  }

  /** Simpan pembayaran tunai */
  savePayment() {
    if (!this.paymentForm.id_order) {
      this.toastr.warning("Pilih Sales Order terlebih dahulu", "Peringatan");
      return;
    }

    this.isLoading = true;
    this.paymentService.createPayment(this.paymentForm).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading = false;
        this.toastr.danger("Gagal menyimpan pembayaran", "Error");
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
