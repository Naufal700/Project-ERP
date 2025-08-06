import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { SalesOrderService } from "./sales-order.service";

@Component({
  selector: "app-sales-order-form-dialog",
  templateUrl: "./sales-order-form-dialog.component.html",
  styleUrls: ["./sales-order-form-dialog.component.scss"],
})
export class SalesOrderFormDialogComponent implements OnInit {
  @Input() order: any; // untuk edit mode

  form: FormGroup;
  pelangganList: any[] = [];
  produkList: any[] = [];

  isLoading = false;
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<SalesOrderFormDialogComponent>,
    private orderService: SalesOrderService,
    private toastr: NbToastrService
  ) {
    this.form = this.fb.group({
      id_pelanggan: [null, Validators.required],
      tanggal: [new Date().toISOString().substring(0, 10), Validators.required],
      details: this.fb.array([this.createDetail()]),
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();
    this.isEdit = !!this.order;
    if (this.isEdit) {
      this.patchForm(this.order);
    }
  }

  /** Buat detail item baru */
  createDetail(): FormGroup {
    return this.fb.group({
      id_produk: [null, Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      harga: [0, [Validators.required, Validators.min(0)]],
      ppn: [11, [Validators.min(0)]], // default 11% PPN
      diskon: [0, [Validators.min(0)]], // default 0% diskon
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  /** Ambil master dropdown pelanggan & produk */
  loadDropdowns() {
    this.orderService.getPelanggan().subscribe({
      next: (res) => (this.pelangganList = res),
      error: () => this.toastr.danger("Gagal memuat data pelanggan", "Error"),
    });

    this.orderService.getProduk().subscribe({
      next: (res) => (this.produkList = res),
      error: () => this.toastr.danger("Gagal memuat data produk", "Error"),
    });
  }

  /** Getter untuk details FormArray */
  get details(): FormArray {
    return this.form.get("details") as FormArray;
  }

  /** Tambah baris detail produk */
  addDetail() {
    this.details.push(this.createDetail());
  }

  /** Hapus baris detail produk */
  removeDetail(index: number) {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  /** Patch data untuk edit */
  patchForm(order: any) {
    this.form.patchValue({
      id_pelanggan: order.id_pelanggan,
      tanggal: order.tanggal.substring(0, 10),
    });

    this.details.clear();
    order.details.forEach((d: any) => {
      this.details.push(
        this.fb.group({
          id_produk: [d.id_produk, Validators.required],
          qty: [d.qty, [Validators.required, Validators.min(1)]],
          harga: [d.harga, [Validators.required, Validators.min(0)]],
          ppn: [d.ppn || 11, [Validators.min(0)]],
          diskon: [d.diskon || 0, [Validators.min(0)]],
        })
      );
    });
  }

  /** Hitung subtotal untuk 1 baris detail */
  getSubtotal(index: number): number {
    const detail = this.details.at(index);
    const qty = detail.get("qty")?.value || 0;
    const harga = detail.get("harga")?.value || 0;
    const ppnPercent = detail.get("ppn")?.value || 0;
    const diskonPercent = detail.get("diskon")?.value || 0;

    const base = harga * qty;
    const diskon = (diskonPercent / 100) * base;
    const ppn = (ppnPercent / 100) * base;

    return base - diskon + ppn;
  }

  /** Hitung total harga (qty * harga) tanpa PPN dan diskon */
  getTotalHarga(index: number): number {
    const detail = this.details.at(index);
    const qty = detail.get("qty")?.value || 0;
    const harga = detail.get("harga")?.value || 0;
    return qty * harga;
  }

  /** Hitung total SO */
  getTotal(): number {
    return this.details.controls.reduce((sum, group) => {
      const qty = group.get("qty")?.value || 0;
      const harga = group.get("harga")?.value || 0;
      const ppnPercent = group.get("ppn")?.value || 0;
      const diskonPercent = group.get("diskon")?.value || 0;

      const base = qty * harga;
      const diskon = (diskonPercent / 100) * base;
      const ppn = (ppnPercent / 100) * base;

      return sum + base - diskon + ppn;
    }, 0);
  }

  /** Update harga jual otomatis saat produk dipilih */
  onProdukChange(index: number) {
    const detail = this.details.at(index);
    const selectedProduk = this.produkList.find(
      (p) => p.id === detail.get("id_produk")?.value
    );
    if (selectedProduk) {
      detail.patchValue({ harga: selectedProduk.harga_jual });
    }
  }

  /** Update subtotal ketika field berubah */
  updateSubtotal(index: number): void {
    this.details.at(index).updateValueAndValidity({ onlySelf: true });
  }

  /** Simpan form (create / update) */
  save() {
    if (
      !this.form.value.tanggal ||
      !this.form.value.id_pelanggan ||
      this.details.length === 0
    ) {
      this.toastr.warning(
        "Harap lengkapi tanggal, pelanggan, dan minimal 1 produk!",
        "Warning"
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning("Periksa kembali form yang belum valid", "Warning");
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.form.value,
      tanggal: this.form.value.tanggal,
      source: "manual", // <-- Tambahkan ini agar masuk ke tab SO Manual
      details: this.form.value.details.map((d: any) => ({
        id_produk: d.id_produk,
        qty: d.qty,
        harga: d.harga,
        ppn: d.ppn,
        diskon: d.diskon,
      })),
    };

    if (this.isEdit) {
      this.orderService.updateManualOrder(this.order.id, payload).subscribe({
        next: () => {
          this.toastr.success("Sales Order berhasil diperbarui", "Sukses");
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.toastr.danger(
            err.error?.message || "Gagal memperbarui Sales Order",
            "Error"
          );
          this.isLoading = false;
        },
      });
    } else {
      this.orderService.createManualOrder(payload).subscribe({
        next: () => {
          this.toastr.success("Sales Order berhasil dibuat", "Sukses");
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.toastr.danger(
            err.error?.message || "Gagal membuat Sales Order",
            "Error"
          );
          this.isLoading = false;
        },
      });
    }
  }

  /** Tutup dialog */
  close() {
    this.dialogRef.close();
  }
}
