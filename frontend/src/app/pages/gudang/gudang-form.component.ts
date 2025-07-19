import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NB_DIALOG_CONFIG, NbToastrService } from "@nebular/theme";
import { GudangService } from "./gudang.service";

@Component({
  selector: "app-gudang-form",
  templateUrl: "./gudang-form.component.html",
  styleUrls: ["./gudang-form.component.scss"],
})
export class GudangFormComponent implements OnInit {
  form!: FormGroup;
  title!: string;
  isEdit = false;
  gudang: any;

  constructor(
    private fb: FormBuilder,
    private service: GudangService,
    private toastr: NbToastrService,
    protected dialogRef: NbDialogRef<GudangFormComponent>,
    @Inject(NB_DIALOG_CONFIG) private config: any
  ) {
    this.gudang = config.context?.gudang || null;
    this.title = config.context?.title || "Form Gudang";
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      kode_gudang: [{ value: "", disabled: true }, Validators.required],
      nama_gudang: ["", Validators.required],
      alamat: ["", Validators.required],
      penanggung_jawab: [""],
      status: ["aktif", Validators.required],
    });

    this.isEdit = !!this.gudang?.id;
    if (this.isEdit) {
      this.form.patchValue(this.gudang);
    } else {
      this.service.getKodeOtomatis().subscribe((res) => {
        this.form.get("kode_gudang")?.setValue(res.kode_gudang);
      });
    }
  }

  simpan() {
    const data = this.form.getRawValue();

    let request;

    if (this.isEdit) {
      request = this.service.update(this.gudang.id, data);
    } else {
      request = this.service.store(data);
    }

    request.subscribe({
      next: () => {
        this.toastr.success(
          `Gudang berhasil ${this.isEdit ? "diperbarui" : "ditambahkan"}`,
          "Sukses"
        );

        this.dialogRef.close(true); // Tutup dialog

        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
      error: (err) => {
        this.toastr.danger("Terjadi kesalahan saat menyimpan data", "Error");
        console.error(err);
      },
    });
  }
}
