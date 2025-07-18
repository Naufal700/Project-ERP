import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { HargaJualService, Produk, HargaJual } from "./harga-jual.service";

@Component({
  templateUrl: "./harga-jual-form.component.html",
  styleUrls: ["./harga-jual-form.component.scss"],
})
export class HargaJualFormComponent implements OnInit {
  @Input() data?: HargaJual;
  form: FormGroup;
  produkList: Produk[] = [];

  constructor(
    private fb: FormBuilder,
    private service: HargaJualService,
    private toastr: NbToastrService,
    private dialogRef: NbDialogRef<HargaJualFormComponent>
  ) {
    this.form = this.fb.group({
      id_produk: [null, Validators.required],
      harga: [null, Validators.required],
      tanggal_mulai: [null, Validators.required],
      tanggal_berakhir: [null],
      aktif: [1, Validators.required],
    });
  }

  ngOnInit(): void {
    this.service.getProduk().subscribe((res) => {
      if (this.data) {
        // Pastikan produk yang sudah dipilih tetap muncul di dropdown
        const currentProduct = res.find((p) => p.id === this.data?.id_produk);
        const aktifProduk = res.filter((p) => p.is_aktif === true);

        this.produkList =
          currentProduct && !currentProduct.is_aktif
            ? [currentProduct, ...aktifProduk]
            : aktifProduk;

        this.form.patchValue(this.data);
      } else {
        this.produkList = res.filter((produk) => produk.is_aktif === true);
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const formData = this.form.value;
    const request = this.data
      ? this.service.update(this.data.id, formData)
      : this.service.create(formData);

    request.subscribe({
      next: () => {
        this.toastr.success(
          `Harga jual berhasil ${this.data ? "diperbarui" : "ditambahkan"}`,
          "Sukses"
        );

        this.dialogRef.close(true); // Tutup form

        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
      error: (err) => {
        console.error(err);
        this.toastr.danger("Gagal menyimpan data", "Error");
      },
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
