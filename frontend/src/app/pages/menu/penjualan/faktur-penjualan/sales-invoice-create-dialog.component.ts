import { Component, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-sales-invoice-create-dialog",
  templateUrl: "./sales-invoice-create-dialog.component.html",
  styleUrls: ["./sales-invoice-create-dialog.components.scss"],
})
export class SalesInvoiceCreateDialogComponent {
  @Input() id_do: number;

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<SalesInvoiceCreateDialogComponent>
  ) {
    this.form = this.fb.group({
      jenis_pembayaran: ["tunai", Validators.required],
      termin: [{ value: 0, disabled: true }, [Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.onMetodeChange(this.form.get("jenis_pembayaran").value);
  }

  onMetodeChange(value: string) {
    if (value === "piutang") {
      this.form.get("termin").enable();
      this.form
        .get("termin")
        .setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.form.get("termin").setValue(0);
      this.form.get("termin").disable();
      this.form.get("termin").clearValidators();
    }
    this.form.get("termin").updateValueAndValidity();
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;

    const jenis_pembayaran = this.form.get("jenis_pembayaran").value;
    const termin = this.form.get("termin").value;

    let tanggal_jatuh_tempo = null;
    if (jenis_pembayaran === "piutang" && termin > 0) {
      const today = new Date();
      today.setDate(today.getDate() + termin);
      tanggal_jatuh_tempo = today.toISOString().split("T")[0]; // format yyyy-MM-dd
    }

    const data = {
      id_do: this.id_do,
      jenis_pembayaran,
      termin: jenis_pembayaran === "piutang" ? termin : undefined,
      tanggal_jatuh_tempo,
    };

    this.dialogRef.close(data); // Kirim data ke parent komponen
  }

  dismiss() {
    this.dialogRef.close(null);
  }
}
