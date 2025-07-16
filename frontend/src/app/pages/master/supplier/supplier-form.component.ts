import { Component, Input, OnInit } from "@angular/core";
import { SupplierService } from "./supplier.service";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-supplier-form",
  templateUrl: "./supplier-form.component.html",
  styleUrls: ["./supplier-form.component.scss"],
})
export class SupplierFormComponent implements OnInit {
  @Input() data: any = {};
  @Input() isEdit: boolean = false;

  form: any = {
    kode_supplier: "",
    nama_supplier: "",
    alamat: "",
    email: "",
    no_telepon: "",
    npwp: "",
    termin_pembayaran: "",
    kategori: "",
  };

  constructor(
    protected dialogRef: NbDialogRef<SupplierFormComponent>,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    if (this.isEdit && this.data) {
      // Mode edit: isi form dari data yang dikirim
      this.form = { ...this.data };
    } else {
      // Mode tambah: generate kode supplier otomatis
      this.generateKodeSupplier();
    }
  }

  save(): void {
    const action$ = this.isEdit
      ? this.supplierService.update(this.form.id, this.form)
      : this.supplierService.create(this.form);

    action$.subscribe({
      next: () => this.dialogRef.close("success"),
      error: (err) => {
        console.error("❌ Gagal menyimpan supplier:", err);
        alert("Terjadi kesalahan saat menyimpan data.");
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  /** Generate kode unik supplier */
  private generateKodeSupplier(): void {
    const prefix = "SUP";
    const unique = Date.now().toString().slice(-6);
    this.form.kode_supplier = `${prefix}-${unique}`;
  }
}
