import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { CoaService } from "./coa.service";
import { Coa } from "./coa.model";

@Component({
  selector: "coa-form-dialog",
  templateUrl: "./coa-form-dialog.component.html",
  styleUrls: ["./coa-form-dialog.component.scss"],
})
export class CoaFormDialogComponent implements OnInit {
  @Input() id: number | null = null;

  akun: Partial<Coa> = {
    kode_akun: "",
    nama_akun: "",
    level_akun: 1,
    parent_kode_akun: "",
    tipe_akun: "",
    kategori_akun: "",
    kategori_laporan: "",
    saldo_normal: "",
    saldo_awal: 0,
    is_header: false,
    keterangan: "",
  };

  daftarParent: Coa[] = [];
  loading = false;

  constructor(
    private coaService: CoaService,
    protected dialogRef: NbDialogRef<CoaFormDialogComponent>,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.loading = true;
      this.coaService.getById(this.id).subscribe((data) => {
        this.akun = {
          ...data,
          parent_kode_akun: data.parent_kode_akun ?? "",
        };
        this.loading = false;
        this.loadParentOptions();
      });
    } else {
      this.loadParentOptions();
    }
  }

  loadParentOptions() {
    this.coaService.getAll().subscribe((res) => {
      const level = this.akun.level_akun || 1;
      this.daftarParent = res.filter(
        (akun) =>
          akun.is_header === true && // pastikan hanya akun header
          akun.level_akun < level &&
          akun.kode_akun !== this.akun.kode_akun
      );
    });
  }

  onLevelChange(level: number) {
    this.akun.level_akun = level;
    this.loadParentOptions();
  }
  formatRupiah(value: number | string): string {
    if (!value) return "";
    const val =
      typeof value === "string" ? value.replace(/\D/g, "") : value.toString();
    return "Rp " + val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  onSaldoInput(event: any) {
    const input = event.target.value.replace(/\D/g, "");
    this.akun.saldo_awal = Number(input);
    event.target.value = this.formatRupiah(input);
  }

  simpan() {
    if (!this.akun.kode_akun || !this.akun.nama_akun) {
      this.toastr.danger("Data COA wajib diisi");
      return;
    }

    const request = this.id
      ? this.coaService.update(this.id, this.akun)
      : this.coaService.create(this.akun);

    request.subscribe({
      next: () => {
        this.toastr.success(
          `COA berhasil ${this.id ? "diperbarui" : "ditambahkan"}`
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.toastr.danger("Gagal mengambil data");
      },
    });
  }

  batal() {
    this.dialogRef.close();
  }
}
