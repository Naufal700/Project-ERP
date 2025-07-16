import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SatuanService } from "./satuan.service";

@Component({
  selector: "app-satuan-form",
  templateUrl: "./satuan-form.component.html",
})
export class SatuanFormComponent implements OnInit {
  @Input() data: any = null;
  @Input() isEdit = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private satuanService: SatuanService,
    private dialogRef: NbDialogRef<SatuanFormComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      kode_satuan: [{ value: "", disabled: true }],
      nama_satuan: ["", Validators.required],
    });

    if (this.isEdit && this.data) {
      this.form.patchValue(this.data);
    } else {
      this.generateKodeOtomatis();
    }
  }

  generateKodeOtomatis(): void {
    this.satuanService.getAll().subscribe((res) => {
      const last = res?.[res.length - 1];
      const nextNumber = last
        ? parseInt(last.kode_satuan?.split("-")?.[1] || "0", 10) + 1
        : 1;
      const kode = "SAT-" + nextNumber.toString().padStart(4, "0");
      this.form.get("kode_satuan")?.setValue(kode);
    });
  }

  simpan(): void {
    if (this.form.invalid) return;

    const payload = {
      ...this.form.getRawValue(),
    };

    const req = this.isEdit
      ? this.satuanService.update(this.data.id, payload)
      : this.satuanService.create(payload);

    req.subscribe({
      next: () => this.dialogRef.close("success"),
      error: (err) => console.error("❌ Gagal simpan satuan:", err),
    });
  }

  batal(): void {
    this.dialogRef.close();
  }
}
