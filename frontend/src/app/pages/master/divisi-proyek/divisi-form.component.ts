import { Component, Inject, OnInit } from "@angular/core";
import { NbDialogRef, NB_DIALOG_CONFIG } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-divisi-form",
  templateUrl: "./divisi-form.component.html",
})
export class DivisiFormComponent implements OnInit {
  form: FormGroup;
  title: string = "Form Divisi";

  constructor(
    protected ref: NbDialogRef<DivisiFormComponent>,
    private fb: FormBuilder,
    @Inject(NB_DIALOG_CONFIG) private config: any
  ) {}

  ngOnInit(): void {
    // Ambil judul dari context, fallback default
    this.title = this.config?.title || "Form Divisi";

    this.form = this.fb.group({
      kode: [this.config?.data?.kode || "", Validators.required],
      nama: [this.config?.data?.nama || "", Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      this.ref.close(this.form.value); // bisa return data ke pemanggil
    }
  }

  cancel() {
    this.ref.close();
  }
}
