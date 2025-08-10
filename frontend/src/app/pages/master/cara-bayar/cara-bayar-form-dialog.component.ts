import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { CaraBayarService } from "./cara-bayar.service";
import { CaraBayar } from "./cara-bayar.model";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-cara-bayar-form-dialog",
  templateUrl: "./cara-bayar-form-dialog.component.html",
  styleUrls: ["./cara-bayar-form-dialog.component.scss"],
})
export class CaraBayarFormDialogComponent implements OnInit {
  @Input() data?: CaraBayar;
  form: FormGroup;
  coaOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CaraBayarService,
    private toastr: NbToastrService,
    protected dialogRef: NbDialogRef<CaraBayarFormDialogComponent>,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nama_cara_bayar: ["", Validators.required],
      tipe: ["kas", Validators.required],
      kode_akun: ["", Validators.required],
      is_default: [false],
    });
  }

  ngOnInit(): void {
    this.loadCoaOptions();

    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  loadCoaOptions(): void {
    // Ganti URL ini sesuai route backend kamu untuk ambil akun kas & bank
    this.http.get<any[]>("/api/coa/kas-bank").subscribe({
      next: (res) => {
        this.coaOptions = res;
      },
      error: () => {
        this.toastr.danger("Gagal mengambil data akun");
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const request = this.data
      ? this.service.update(this.data.id, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.toastr.success("Data berhasil disimpan");
        this.dialogRef.close(true);
      },
      error: () => {
        this.toastr.danger("Gagal menyimpan data");
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
