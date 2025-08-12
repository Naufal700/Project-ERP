import { Component, OnInit, Input } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { PiutangService, SalesInvoice } from "./piutang.service";

@Component({
  selector: "app-collecting-invoice-dialog",
  templateUrl: "./collecting-invoice-dialog.component.html",
})
export class CollectingInvoiceDialogComponent implements OnInit {
  @Input() invoices: SalesInvoice[] = [];
  @Input() isBatch: boolean = true;

  filteredInvoices: SalesInvoice[] = [];
  selectedInvoiceIds: number[] = [];
  searchTerm: string = "";
  loading = false;

  constructor(
    protected dialogRef: NbDialogRef<CollectingInvoiceDialogComponent>,
    private piutangService: PiutangService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    if (this.invoices.length > 0) {
      // Jika invoices sudah diterima via @Input context, pakai langsung
      this.filteredInvoices = [...this.invoices];
    } else {
      // Kalau tidak ada invoices input, load dari service
      this.loadInvoices();
    }
  }

  loadInvoices() {
    this.loading = true;
    this.piutangService
      .getInvoices(["approved", "collecting"], "piutang", "")
      .subscribe({
        next: (res) => {
          this.invoices = res;
          this.applyFilter();
          this.loading = false;
        },
        error: () => {
          this.toastrService.danger("Gagal memuat data invoice");
          this.loading = false;
        },
      });
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredInvoices = [...this.invoices];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredInvoices = this.invoices.filter((inv) =>
      inv.nama_pelanggan.toLowerCase().includes(term)
    );
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

  toggleSelectAll(checked: boolean) {
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

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.selectedInvoiceIds.length === 0) {
      this.toastrService.warning("Pilih minimal 1 invoice");
      return;
    }
    this.dialogRef.close(this.selectedInvoiceIds);
  }
}
