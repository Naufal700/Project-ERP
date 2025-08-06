import { Component, Input } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { CaraBayarService } from "./cara-bayar.service";

@Component({
  selector: "app-cara-bayar-form-dialog",
  templateUrl: "./cara-bayar-form-dialog.component.html",
  styleUrls: ["./cara-bayar-form-dialog.component.scss"],
})
export class CaraBayarFormDialogComponent {
  @Input() caraBayar: any;
  formData: any = { kode_cara_bayar: "", nama_cara_bayar: "" };

  constructor(
    private dialogRef: NbDialogRef<CaraBayarFormDialogComponent>,
    private caraBayarService: CaraBayarService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    if (this.caraBayar) {
      this.formData = {
        kode_cara_bayar: this.caraBayar.kode_cara_bayar,
        nama_cara_bayar: this.caraBayar.nama_cara_bayar,
      };
    }
  }

  save() {
    const request = this.caraBayar
      ? this.caraBayarService.updateCaraBayar(this.caraBayar.id, this.formData)
      : this.caraBayarService.createCaraBayar(this.formData);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.caraBayar
            ? "Cara bayar berhasil diperbarui"
            : "Cara bayar berhasil ditambahkan",
          "Sukses"
        );
        this.dialogRef.close(true);
      },
      error: () =>
        this.toastr.danger("Gagal menyimpan data cara bayar", "Error"),
    });
  }

  close() {
    this.dialogRef.close();
  }
}
