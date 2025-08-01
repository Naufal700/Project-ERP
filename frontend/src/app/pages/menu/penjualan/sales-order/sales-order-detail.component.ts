import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-sales-order-detail",
  templateUrl: "./sales-order-detail.component.html",
  styleUrls: ["./sales-order-detail.component.scss"],
})
export class SalesOrderDetailComponent {
  @Input() order: any;

  constructor(private dialogRef: NbDialogRef<SalesOrderDetailComponent>) {}

  getTotal() {
    return this.order.details.reduce(
      (total: number, d: any) => total + d.qty * d.harga,
      0
    );
  }

  close() {
    this.dialogRef.close();
  }
}
