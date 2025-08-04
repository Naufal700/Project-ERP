import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-invoice-detail-dialog",
  templateUrl: "./invoice-detail-dialog.component.html",
  styleUrls: ["./invoice-detail-dialog.component.scss"],
})
export class InvoiceDetailDialogComponent {
  @Input() invoice: any;

  constructor(protected dialogRef: NbDialogRef<InvoiceDetailDialogComponent>) {}

  close() {
    this.dialogRef.close();
  }
}
