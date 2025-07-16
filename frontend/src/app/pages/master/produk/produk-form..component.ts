import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProdukService } from "./produk.service";
import { KategoriProdukService } from "../kategori-produk/kategori-produk.service";
import { SatuanService } from "../satuan/satuan.service";

@Component({
  selector: "app-produk-form",
  templateUrl: "./produk-form.component.html",
  styleUrls: ["./produk-form.component.scss"],
})
export class ProdukFormComponent implements OnInit {
  @Input() data: any = {};
  @Input() isEdit: boolean = false;

  form!: FormGroup;
  kategoriList: any[] = [];
  satuanList: any[] = [];

  constructor(
    protected ref: NbDialogRef<ProdukFormComponent>,
    private fb: FormBuilder,
    private produkService: ProdukService,
    private kategoriService: KategoriProdukService,
    private satuanService: SatuanService
  ) {}

  ngOnInit(): void {
    // Inisialisasi form
    this.form = this.fb.group({
      kode_produk: [{ value: "", disabled: true }, Validators.required],
      nama_produk: [this.data.nama_produk || "", Validators.required],
      id_kategori: [this.data.id_kategori || null],
      id_satuan: [this.data.id_satuan || null],
      deskripsi: [this.data.deskripsi || ""],
      is_aktif: [this.data.is_aktif ?? true],
    });

    // Ambil master data
    this.kategoriService.getAll().subscribe((res) => (this.kategoriList = res));
    this.satuanService.getAll().subscribe((res) => (this.satuanList = res));

    // Jika tambah data, generate kode otomatis
    if (!this.isEdit) {
      this.produkService.generateKode().subscribe({
        next: (res) => {
          this.form.patchValue({ kode_produk: res.kode });
        },
        error: (err) => {
          console.error("❌ Gagal generate kode:", err);
        },
      });
    } else {
      this.form.patchValue({ kode_produk: this.data.kode_produk });
    }
  }

  simpan(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue(); // untuk ambil `kode_produk` walaupun disabled
    const payload = { ...raw };

    const request = this.isEdit
      ? this.produkService.update(this.data.id, payload)
      : this.produkService.store(payload);

    request.subscribe({
      next: () => this.ref.close("success"),
      error: (err) => console.error("❌ Gagal simpan:", err),
    });
  }

  batal(): void {
    this.ref.close();
  }
}
