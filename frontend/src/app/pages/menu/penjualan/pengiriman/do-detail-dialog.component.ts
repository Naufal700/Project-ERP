import { Component, OnInit, Input } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { DeliveryOrderService } from "./delivery-order.service";

@Component({
  selector: "app-do-detail-dialog",
  templateUrl: "./do-detail-dialog.component.html",
  styleUrls: ["./do-detail-dialog.component.scss"],
})
export class DODetailDialogComponent implements OnInit {
  @Input() id!: number;
  doDetail: any;
  isLoading = false;

  constructor(
    private doService: DeliveryOrderService,
    private toastr: NbToastrService,
    protected dialogRef: NbDialogRef<DODetailDialogComponent>
  ) {}

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail() {
    this.isLoading = true;
    this.doService.getDetailDO(this.id).subscribe((data) => {
      this.doDetail = data;
      this.isLoading = false;
    });
  }

  approveDO() {
    this.doService.approveDO(this.id).subscribe(() => {
      this.toastr.success("DO berhasil di-approve!", "Sukses");
      this.loadDetail();
    });
  }

  cancelDO() {
    this.doService.cancelDO(this.id).subscribe(() => {
      this.toastr.warning("DO berhasil dibatalkan", "Info");
      this.loadDetail();
    });
  }

  close() {
    this.dialogRef.close();
  }
}
