import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-verify-dialog",
  templateUrl: "./verify-dialog.component.html",
  styleUrls: ["./verify-dialog.component.scss"],
})
export class VerifyDialogComponent implements OnInit {
  @Input() orders: any[] = [];

  products: any[] = [];
  totalPpn: number = 0;
  totalDiskon: number = 0;

  constructor(protected dialogRef: NbDialogRef<VerifyDialogComponent>) {}

  ngOnInit(): void {
    this.prepareProducts();
    this.calculateTotals();
  }

  /** Siapkan daftar produk dari semua order */
  prepareProducts() {
    this.products = this.orders.reduce((acc: any[], order) => {
      const details = (order.details || []).map((d: any) => ({
        orderId: order.id,
        id_produk: d.id_produk, // ✅ untuk update di backend
        pelanggan:
          order.pelanggan?.nama_pelanggan ||
          order.quotation?.pelanggan?.nama_pelanggan ||
          "-",
        id: d.id,
        nama_produk: d.produk?.nama_produk || "-",
        qty: d.qty,
        harga: d.harga,
        subtotal: d.qty * d.harga,
        diskon: d.diskon || 0,
        ppn: d.ppn || 0, // sekarang numeric
      }));
      return acc.concat(details);
    }, []);
  }

  /** Hitung total PPN & Diskon */
  calculateTotals() {
    this.totalDiskon = this.products.reduce(
      (sum, p) => sum + (p.diskon || 0),
      0
    );
    this.totalPpn = this.products.reduce((sum, p) => sum + (p.ppn || 0), 0);
  }

  /** Toggle PPN (checkbox) → jika dicentang hitung 11% dari subtotal */
  togglePpn(product: any, event: any) {
    const checked = event.target.checked;
    product.ppn = checked ? product.subtotal * 0.11 : 0;
    this.calculateTotals();
  }

  /** Update diskon (input manual) */
  updateDiskon(product: any, event: any) {
    product.diskon = parseFloat(event.target.value) || 0;
    this.calculateTotals();
  }

  /** Submit hasil verifikasi */
  confirm() {
    this.dialogRef.close({
      ids: this.orders.map((o) => o.id),
      products: this.products.map((p) => ({
        order_id: p.orderId,
        id_produk: p.id_produk, // ✅ wajib dikirim ke backend
        diskon: p.diskon,
        ppn: p.ppn, // ✅ kirim nominal PPN
      })),
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
