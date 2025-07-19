import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NB_DIALOG_CONFIG } from "@nebular/theme";

@Component({
  selector: "app-proyek-form",
  templateUrl: "./proyek-form.component.html",
})
export class ProyekFormComponent implements OnInit {
  form: FormGroup;
  title: string = "Form Proyek";
  jenisPenanggung = "karyawan";

  constructor(
    private fb: FormBuilder,
    protected ref: NbDialogRef<ProyekFormComponent>,
    @Inject(NB_DIALOG_CONFIG) private config: any
  ) {}

  ngOnInit(): void {
    this.title = this.config?.title || "Form Proyek";

    this.jenisPenanggung = this.config?.data?.jenis_penanggung || "karyawan";

    this.form = this.fb.group({
      kode: [this.config?.data?.kode || "", Validators.required],
      nama: [this.config?.data?.nama || "", Validators.required],
      tanggal_mulai: [
        this.config?.data?.tanggal_mulai || "",
        Validators.required,
      ],
      tanggal_selesai: [
        this.config?.data?.tanggal_selesai || "",
        Validators.required,
      ],
      jenis_penanggung: [this.jenisPenanggung],
      penanggung_jawab: [this.config?.data?.penanggung_jawab || ""],
    });
  }

  submit() {
    if (this.form.valid) {
      this.ref.close(this.form.value); // mengembalikan data ke pemanggil
    }
  }

  cancel() {
    this.ref.close();
  }

  changeJenis(val: string) {
    this.jenisPenanggung = val;
    this.form.patchValue({ jenis_penanggung: val });
  }
}
