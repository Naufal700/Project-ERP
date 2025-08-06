import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { SalesInvoiceService } from "./sales-invoice.service";
import { InvoiceDetailDialogComponent } from "./invoice-detail-dialog.component";

@Component({
  selector: "app-sales-invoice",
  templateUrl: "./sales-invoice.component.html",
  styleUrls: ["./sales-invoice.component.scss"],
})
export class SalesInvoiceComponent implements OnInit {
  activeTab: string = "do-ready";
  isRefreshing = false;

  invoices: any[] = [];
  availableDO: any[] = [];

  searchTermInvoice = "";
  searchTermDO = "";
  filterStatus = "";
  fromDate: Date | null = null;
  toDate: Date | null = null;

  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private invoiceService: SalesInvoiceService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  /** Refresh data faktur & DO siap difaktur */
  refreshData() {
    this.isRefreshing = true;

    // Ambil daftar faktur
    this.invoiceService.getInvoices().subscribe({
      next: (res) => {
        this.invoices = res.map((inv: any) => ({
          ...inv,
          bruto: inv.bruto ?? 0,
          diskon: inv.diskon ?? 0,
          ppn: inv.ppn ?? 0,
          netto: inv.netto ?? inv.bruto - (inv.diskon ?? 0) + (inv.ppn ?? 0), // fallback jika backend belum kirim netto
        }));
        this.isRefreshing = false;
      },
      error: () => {
        this.toastr.danger("Gagal memuat data faktur");
        this.isRefreshing = false;
      },
    });

    // Ambil daftar DO siap faktur
    this.invoiceService.getAvailableDO().subscribe({
      next: (res) => (this.availableDO = res),
      error: () => this.toastr.danger("Gagal memuat DO siap faktur"),
    });
  }

  /** Hitung total DO */
  getTotalDO(doData: any): number {
    if (!doData || !doData.items) return 0;
    return doData.items.reduce(
      (sum: number, item: any) => sum + item.qty * item.harga,
      0
    );
  }

  /** Buat faktur dari DO (langsung verifikasi) */
  createInvoice(doId: number) {
    this.invoiceService.createInvoice({ id_do: doId }).subscribe({
      next: () => {
        this.toastr.success("Faktur berhasil dibuat dari DO");
        this.refreshData();
        this.activeTab = "invoice-list"; // langsung pindah ke daftar faktur
      },
      error: (err) =>
        this.toastr.danger(err.error?.message || "Gagal membuat faktur"),
    });
  }

  /** Approve faktur */
  approveInvoice(id: number) {
    this.invoiceService.approveInvoice(id).subscribe({
      next: () => {
        this.toastr.success("Faktur berhasil di-approve");
        this.refreshData();
      },
      error: (err) =>
        this.toastr.danger(err.error?.message || "Gagal approve faktur"),
    });
  }

  /** Rollback faktur */
  rollbackInvoice(id: number) {
    this.invoiceService.rollbackInvoice(id).subscribe({
      next: () => {
        this.toastr.success("Faktur berhasil di-rollback");
        this.refreshData();
      },
      error: (err) =>
        this.toastr.danger(err.error?.message || "Gagal rollback faktur"),
    });
  }

  /** Batalkan faktur */
  cancelInvoice(id: number) {
    this.invoiceService.cancelInvoice(id).subscribe({
      next: () => {
        this.toastr.success("Faktur berhasil dibatalkan");
        this.refreshData();
      },
      error: (err) =>
        this.toastr.danger(err.error?.message || "Gagal cancel faktur"),
    });
  }

  /** Cetak faktur (hanya jika approved) */
  printInvoice(id: number) {
    this.invoiceService.printInvoice(id).subscribe({
      next: (res) => {
        const blob = new Blob([res], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      },
      error: () => this.toastr.danger("Gagal mencetak faktur"),
    });
  }

  /** Filter daftar faktur */
  getFilteredInvoices() {
    return this.invoices.filter((inv) => {
      const matchSearch =
        !this.searchTermInvoice ||
        inv.nomor_invoice
          ?.toLowerCase()
          .includes(this.searchTermInvoice.toLowerCase()) ||
        inv.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTermInvoice.toLowerCase());

      const matchStatus =
        !this.filterStatus || inv.status === this.filterStatus;

      const matchDate =
        (!this.fromDate || new Date(inv.tanggal) >= new Date(this.fromDate)) &&
        (!this.toDate || new Date(inv.tanggal) <= new Date(this.toDate));

      return matchSearch && matchStatus && matchDate;
    });
  }

  /** Pagination */
  getPages(data: any[]) {
    return Array(Math.ceil(data.length / this.itemsPerPage)).fill(0);
  }

  /** Dialog detail faktur */
  openDetailDialog(invoice: any) {
    this.dialogService.open(InvoiceDetailDialogComponent, {
      context: { invoice },
    });
  }
  /** Hitung total summary dari semua faktur yang difilter pada halaman aktif */
  getInvoiceTotals() {
    const filtered = this.getFilteredInvoices().slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
    return {
      bruto: filtered.reduce((sum, inv) => sum + (inv.bruto || 0), 0),
      diskon: filtered.reduce((sum, inv) => sum + (inv.diskon || 0), 0),
      ppn: filtered.reduce((sum, inv) => sum + (inv.ppn || 0), 0),
      netto: filtered.reduce((sum, inv) => sum + (inv.netto || 0), 0),
    };
  }
}
