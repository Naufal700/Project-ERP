import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { PelangganService } from "./pelanggan.service";

@Component({
  selector: "pelanggan-form-dialog",
  templateUrl: "./pelanggan-form.component.html",
})
export class PelangganFormDialogComponent implements OnInit {
  @Input() id: number | null = null;

  pelanggan = {
    kode_pelanggan: "",
    nama_pelanggan: "",
    email: "",
    telepon: "",
    alamat: "",
  };

  constructor(
    private pelangganService: PelangganService,
    protected dialogRef: NbDialogRef<PelangganFormDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.pelangganService.getById(this.id).subscribe((data) => {
        this.pelanggan = data;
      });
    } else {
      this.generateKodePelanggan();
    }
  }

  generateKodePelanggan() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const kode = `PL-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${random}`;
    this.pelanggan.kode_pelanggan = kode;
  }

  simpan() {
    console.log("🟢 Submit form:", this.pelanggan);

    if (this.id) {
      this.pelangganService.update(this.id, this.pelanggan).subscribe(() => {
        alert("✅ Pelanggan berhasil diubah");
        this.dialogRef.close(true);
      });
    } else {
      this.pelangganService.create(this.pelanggan).subscribe(() => {
        alert("✅ Pelanggan berhasil ditambahkan");
        this.dialogRef.close(true);
      });
    }
  }

  batal() {
    this.dialogRef.close();
  }
}
