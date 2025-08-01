import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { SalesQuotationService } from "./sales-quotation.service";

@Component({
  selector: "app-sales-quotation-form",
  templateUrl: "./sales-quotation-form.component.html",
  styleUrls: ["./sales-quotation-form.component.scss"],
})
export class SalesQuotationFormComponent implements OnInit {
  @Input() data: any;
  pelangganList: any[] = [];
  produkList: any[] = [];
  loading = false; // Tambahan loading state

  formData: any = {
    tanggal: new Date(),
    id_pelanggan: "",
    catatan: "",
    details: [],
  };

  constructor(
    private dialogRef: NbDialogRef<SalesQuotationFormComponent>,
    private quotationService: SalesQuotationService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();

    // Jika edit data
    if (this.data) {
      this.formData = {
        tanggal: this.data.tanggal, // langsung ambil string tanggal
        id_pelanggan: this.data.id_pelanggan,
        catatan: this.data.catatan || "",
        details:
          this.data.details?.map((d: any) => ({
            id_produk: d.id_produk,
            qty: d.qty,
            harga: d.harga,
          })) || [],
      };
    }

    // Minimal 1 baris detail jika tambah data baru
    if (!this.data) {
      this.addDetail();
    }
  }

  onProductChange(index: number) {
    const selectedId = this.formData.details[index].id_produk;
    const selectedProduct = this.produkList.find((p) => p.id === selectedId);

    if (selectedProduct) {
      this.formData.details[index].harga = selectedProduct.harga_jual;
    }
  }

  loadDropdownData() {
    this.quotationService
      .getPelanggan()
      .subscribe((res) => (this.pelangganList = res));
    this.quotationService
      .getProduk()
      .subscribe((res) => (this.produkList = res));
  }

  addDetail() {
    this.formData.details.push({ id_produk: "", qty: 1, harga: 0 });
  }

  removeDetail(index: number) {
    this.formData.details.splice(index, 1);
  }

  calculateSubtotal(detail: any): number {
    return detail.qty * detail.harga;
  }

  getTotal(): number {
    return this.formData.details.reduce(
      (sum: number, d: any) => sum + this.calculateSubtotal(d),
      0
    );
  }

  save() {
    console.log("Save clicked", this.formData);

    // Cek token sebelum kirim request
    console.log("Token yang dipakai:", localStorage.getItem("token"));

    if (!this.formData.id_pelanggan || this.formData.details.length === 0) {
      this.toastrService.warning(
        "Lengkapi semua data sebelum menyimpan",
        "Peringatan"
      );
      return;
    }

    const payload = {
      ...this.formData,
      tanggal: this.formatDate(this.formData.tanggal),
    };

    this.loading = true;

    if (this.data) {
      this.quotationService.update(this.data.id, payload).subscribe({
        next: () => {
          this.toastrService.success("Penawaran berhasil diupdate", "Sukses");
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.toastrService.danger("Gagal update penawaran", "Error");
        },
        complete: () => (this.loading = false),
      });
    } else {
      this.quotationService.create(payload).subscribe({
        next: () => {
          this.toastrService.success(
            "Penawaran berhasil ditambahkan",
            "Sukses"
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err); // <- Cek error response
          this.toastrService.danger("Gagal menambah penawaran", "Error");
        },
        complete: () => (this.loading = false),
      });
    }
  }

  formatDate(date: any): string {
    if (!date) return "";
    if (typeof date === "string") return date; // sudah dalam format 'YYYY-MM-DD'
    return date.toISOString().split("T")[0]; // jika Date object
  }

  cancel() {
    this.dialogRef.close();
  }
}
