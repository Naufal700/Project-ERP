import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef } from "@nebular/theme";
import { KaryawanService } from "./karyawan.service";

@Component({
  selector: "app-karyawan-form",
  templateUrl: "./karyawan-form.component.html",
  styleUrls: ["./karyawan-form.component.scss"],
})
export class KaryawanFormComponent implements OnInit {
  @Input() data: any; // data untuk edit
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<KaryawanFormComponent>,
    private karyawanService: KaryawanService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nama_lengkap: ["", Validators.required],
      nip: ["", Validators.required],
      jenis_kelamin: ["", Validators.required],
      tanggal_lahir: ["", Validators.required],
      tempat_lahir: ["", Validators.required],
      alamat: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      no_hp: ["", Validators.required],
      jabatan: ["", Validators.required],
      divisi: ["", Validators.required],
      tanggal_masuk: ["", Validators.required],
      is_aktif: [true, Validators.required],
    });

    if (this.data) {
      // Patch form dengan data yang ada, convert tanggal ke objek Date supaya datepicker bisa tampil
      const dataForPatch = {
        ...this.data,
        tanggal_lahir: this.data.tanggal_lahir
          ? new Date(this.data.tanggal_lahir)
          : null,
        tanggal_masuk: this.data.tanggal_masuk
          ? new Date(this.data.tanggal_masuk)
          : null,
      };
      this.form.patchValue(dataForPatch);
    }
  }

  simpan(): void {
    if (this.form.invalid) return;

    const formValue = { ...this.form.value };

    // Jika tanggal masih berupa objek Date, ubah ke string format YYYY-MM-DD
    if (formValue.tanggal_lahir instanceof Date) {
      formValue.tanggal_lahir = this.formatDate(formValue.tanggal_lahir);
    }

    if (formValue.tanggal_masuk instanceof Date) {
      formValue.tanggal_masuk = this.formatDate(formValue.tanggal_masuk);
    }

    if (this.data) {
      this.karyawanService.update(this.data.id, formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error("Gagal update:", err),
      });
    } else {
      this.karyawanService.create(formValue).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error("Gagal simpan:", err),
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  batal(): void {
    this.dialogRef.close();
  }
}
