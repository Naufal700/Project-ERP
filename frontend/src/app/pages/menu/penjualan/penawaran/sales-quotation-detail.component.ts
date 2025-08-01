import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-sales-quotation-detail",
  templateUrl: "./sales-quotation-detail.component.html",
  styleUrls: ["./sales-quotation-detail.component.scss"],
})
export class SalesQuotationDetailComponent {
  @Input() quotation: any;

  constructor(private dialogRef: NbDialogRef<SalesQuotationDetailComponent>) {}

  close() {
    this.dialogRef.close();
  }

  getTotal(): number {
    return (
      this.quotation.details?.reduce(
        (sum: number, d: any) => sum + d.qty * d.harga,
        0
      ) || 0
    );
  }
}
