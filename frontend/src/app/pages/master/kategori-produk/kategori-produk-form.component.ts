import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KategoriProdukService } from "./kategori-produk.service";

@Component({
  selector: "app-kategori-produk-form",
  templateUrl: "./kategori-produk-form.component.html",
})
export class KategoriProdukFormComponent implements OnInit {
  @Input() data: any = {};
  @Input() isEdit: boolean = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private kategoriService: KategoriProdukService,
    private dialogRef: NbDialogRef<any>
  ) {
    this.form = this.fb.group({
      kode_kategori: [{ value: "", disabled: true }, Validators.required],
      nama_kategori: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.isEdit) {
      this.form.patchValue(this.data);
    } else {
      this.kategoriService.generateKode().subscribe((res) => {
        this.form.get("kode_kategori")?.setValue(res.kode);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.getRawValue(),
    };

    const req = this.isEdit
      ? this.kategoriService.update(this.data.id, payload)
      : this.kategoriService.create(payload);

    req.subscribe({
      next: () => this.dialogRef.close("success"),
      error: (err) => console.error("❌ Gagal simpan:", err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
