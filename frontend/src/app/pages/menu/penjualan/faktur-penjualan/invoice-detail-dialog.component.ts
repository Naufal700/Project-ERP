import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-invoice-detail-dialog",
  templateUrl: "./invoice-detail-dialog.component.html",
  styleUrls: ["./invoice-detail-dialog.component.scss"],
})
export class InvoiceDetailDialogComponent implements OnInit {
  @Input() invoice: any;

  constructor(protected dialogRef: NbDialogRef<InvoiceDetailDialogComponent>) {}

  ngOnInit() {
    if (this.invoice && this.invoice.details) {
      this.calculateTotals();
    }
  }

  /** Hitung total bruto, diskon, ppn, dan total netto jika belum ada */
  private calculateTotals() {
    const details = this.invoice.details || [];

    const bruto = details.reduce(
      (sum: number, item: any) => sum + item.qty * item.harga,
      0
    );
    const diskon = details.reduce(
      (sum: number, item: any) => sum + (item.diskon || 0),
      0
    );
    const ppn = details.reduce(
      (sum: number, item: any) => sum + (item.ppn || 0),
      0
    );
    const total = bruto - diskon + ppn;

    this.invoice.bruto = this.invoice.bruto ?? bruto;
    this.invoice.diskon = this.invoice.diskon ?? diskon;
    this.invoice.ppn = this.invoice.ppn ?? ppn;
    this.invoice.total = this.invoice.total ?? total;
  }

  close() {
    this.dialogRef.close();
  }
}
