import { Component, OnInit } from "@angular/core";
import { PiutangService, SalesInvoice, SalesPiutang } from "./piutang.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { CollectingInvoiceDialogComponent } from "./collecting-invoice-dialog.component";

@Component({
  selector: "app-piutang",
  templateUrl: "./piutang.component.html",
  styleUrls: ["./piutang.component.scss"],
})
export class PiutangComponent implements OnInit {
  invoices: SalesInvoice[] = [];
  filteredInvoices: SalesInvoice[] = [];
  piutangs: SalesPiutang[] = [];

  // Filter controls
  searchTerm = "";
  selectedCustomerId: number | null = null;
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;

  selectedInvoiceIds: number[] = [];

  loading = false;

  customers: { id: number; nama_pelanggan: string }[] = [];

  constructor(
    private piutangService: PiutangService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadPiutangs();
  }

  loadInvoices() {
    this.loading = true;
    this.piutangService
      .getInvoices(["approved", "collecting"], "piutang", this.searchTerm)
      .subscribe({
        next: (res) => {
          this.invoices = res;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.toastrService.danger("Gagal memuat data invoice");
          this.loading = false;
        },
      });
  }

  loadPiutangs() {
    this.piutangService.getPiutangs().subscribe({
      next: (res) => {
        this.piutangs = res;
      },
      error: () => {
        this.toastrService.danger("Gagal memuat data piutang");
      },
    });
  }

  applyFilters() {
    let temp = [...this.invoices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter((inv) =>
        inv.nama_pelanggan.toLowerCase().includes(term)
      );
    }

    if (this.selectedCustomerId) {
      temp = temp.filter((inv) => inv.id_pelanggan === this.selectedCustomerId);
    }

    if (this.filterStartDate) {
      temp = temp.filter(
        (inv) => new Date(inv.tanggal) >= this.filterStartDate!
      );
    }
    if (this.filterEndDate) {
      temp = temp.filter((inv) => new Date(inv.tanggal) <= this.filterEndDate!);
    }

    this.filteredInvoices = temp;

    // Reset selection invoice yang sudah tidak tampil
    this.selectedInvoiceIds = this.selectedInvoiceIds.filter((id) =>
      this.filteredInvoices.some((inv) => inv.id === id)
    );
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  toggleInvoiceSelection(invoiceId: number, checked: boolean) {
    if (checked) {
      if (!this.selectedInvoiceIds.includes(invoiceId)) {
        this.selectedInvoiceIds.push(invoiceId);
      }
    } else {
      this.selectedInvoiceIds = this.selectedInvoiceIds.filter(
        (id) => id !== invoiceId
      );
    }
  }

  areAllSelected(): boolean {
    return (
      this.filteredInvoices.length > 0 &&
      this.filteredInvoices.every((inv) =>
        this.selectedInvoiceIds.includes(inv.id)
      )
    );
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.filteredInvoices.forEach((inv) => {
        if (!this.selectedInvoiceIds.includes(inv.id)) {
          this.selectedInvoiceIds.push(inv.id);
        }
      });
    } else {
      this.selectedInvoiceIds = this.selectedInvoiceIds.filter(
        (id) => !this.filteredInvoices.some((inv) => inv.id === id)
      );
    }
  }

  getTotalBayar(invoice: SalesInvoice): number {
    const relatedPiutangs = this.piutangs.filter(
      (p) => p.sales_invoice_id === invoice.id
    );
    return relatedPiutangs.reduce(
      (sum, p) => sum + (p.jumlah_terbayar || 0),
      0
    );
  }

  getSisaPiutang(invoice: SalesInvoice): number {
    const totalBayar = this.getTotalBayar(invoice);
    return invoice.total - totalBayar;
  }

  approvePiutang(invoice: SalesInvoice) {
    this.piutangService.approveInvoicePiutang(invoice.id).subscribe({
      next: () => {
        this.toastrService.success("Piutang berhasil disimpan");
        this.loadPiutangs();
        this.loadInvoices();
        this.selectedInvoiceIds = this.selectedInvoiceIds.filter(
          (id) => id !== invoice.id
        );
      },
      error: () => {
        this.toastrService.danger("Gagal menyimpan piutang");
      },
    });
  }

  openCollectingDialog() {
    this.dialogService
      .open(CollectingInvoiceDialogComponent, {
        context: {},
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((selectedInvoiceIds: number[] | undefined) => {
        if (selectedInvoiceIds && selectedInvoiceIds.length > 0) {
          // Kirim piutang_ids ke API collecting
          this.piutangService
            .collecting({ piutang_ids: selectedInvoiceIds })
            .subscribe({
              next: () => {
                this.toastrService.success("Collecting berhasil");
                this.loadPiutangs();
                this.loadInvoices();
                this.selectedInvoiceIds = [];
              },
              error: () => {
                this.toastrService.danger("Gagal melakukan collecting");
              },
            });
        }
      });
  }

  cancelPiutang(invoice: SalesInvoice) {
    if (!confirm(`Batalkan piutang untuk invoice ${invoice.nomor_invoice}?`))
      return;

    this.piutangService.cancelPiutang(invoice.id).subscribe({
      next: () => {
        this.toastrService.success("Piutang berhasil dibatalkan");
        this.loadInvoices();
        this.loadPiutangs();
        this.selectedInvoiceIds = this.selectedInvoiceIds.filter(
          (id) => id !== invoice.id
        );
      },
      error: () => {
        this.toastrService.danger("Gagal membatalkan piutang");
      },
    });
  }

  // Fungsi baru: verifikasi batch invoice terpilih
  verifySelectedInvoices() {
    if (this.selectedInvoiceIds.length === 0) {
      this.toastrService.warning("Pilih minimal 1 invoice untuk diverifikasi");
      return;
    }

    this.piutangService.verifyInvoices(this.selectedInvoiceIds).subscribe({
      next: () => {
        this.toastrService.success("Invoice terpilih berhasil diverifikasi");
        this.loadInvoices();
        this.loadPiutangs();
        this.selectedInvoiceIds = [];
      },
      error: (err) => {
        this.toastrService.danger("Gagal melakukan verifikasi invoice");
        console.error(err);
      },
    });
  }
  isJatuhTempoSegera(tanggalJatuhTempo: string): boolean {
    const now = new Date();
    const jatuhTempo = new Date(tanggalJatuhTempo);
    const diffTime = jatuhTempo.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7; // 0 sampai 1 hari
  }
  getStatusLabel(status: string): string {
    if (status === "approved") return "draft";
    if (status === "collecting") return "collecting";
    return status;
  }
}
