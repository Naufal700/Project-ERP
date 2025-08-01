import { Component, OnInit } from "@angular/core";
import { NbToastrService } from "@nebular/theme";
import { SalesOrderService } from "./sales-order.service";

@Component({
  selector: "app-sales-order",
  templateUrl: "./sales-order.component.html",
  styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent implements OnInit {
  draftQuotations: any[] = [];
  salesOrders: any[] = [];
  activeTab: string = "draft";
  filterDate: string = "";
  searchTerm: string = "";

  // Pagination
  currentPageDraft: number = 1;
  currentPageOrders: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private orderService: SalesOrderService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === "draft") this.currentPageDraft = 1;
    else this.currentPageOrders = 1;
  }

  loadDraftQuotations() {
    this.orderService.getDraftQuotations().subscribe({
      next: (res) => (this.draftQuotations = res),
      error: () => this.toastr.danger("Gagal memuat SQ draft", "Error"),
    });
  }

  loadSalesOrders() {
    this.orderService.getOrders().subscribe({
      next: (res) => (this.salesOrders = res),
      error: () => this.toastr.danger("Gagal memuat Sales Order", "Error"),
    });
  }

  approveQuotation(id: number) {
    if (confirm("Yakin ingin approve SQ ini?")) {
      this.orderService.approveQuotation(id).subscribe({
        next: (res) => {
          this.toastr.success(
            `SQ di-approve. SO baru: ${res.nomor_order}`,
            "Sukses"
          );
          this.refreshData();
        },
        error: () => this.toastr.danger("Gagal approve SQ", "Error"),
      });
    }
  }

  rejectQuotation(id: number) {
    if (confirm("Yakin ingin reject SQ ini?")) {
      this.orderService.rejectQuotation(id).subscribe({
        next: () => {
          this.toastr.warning("SQ berhasil di-reject", "Info");
          this.loadDraftQuotations();
        },
        error: () => this.toastr.danger("Gagal reject SQ", "Error"),
      });
    }
  }

  cancelOrder(id: number) {
    if (confirm("Yakin ingin membatalkan Sales Order ini?")) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.toastr.warning("Sales Order berhasil dibatalkan", "Info");
          this.loadSalesOrders();
        },
        error: () =>
          this.toastr.danger("Gagal membatalkan Sales Order", "Error"),
      });
    }
  }

  refreshData() {
    if (this.activeTab === "draft") {
      this.loadDraftQuotations();
    } else {
      this.loadSalesOrders();
    }
  }

  /** ✅ Hitung total SQ */
  getQuotationTotal(details: any[]): number {
    return (
      details?.reduce((sum, d) => sum + (d.qty || 0) * (d.harga || 0), 0) || 0
    );
  }

  /** ✅ Filter SQ dengan search & tanggal */
  getFilteredQuotations() {
    return this.draftQuotations.filter((q) => {
      const matchSearch =
        !this.searchTerm ||
        q.nomor_quotation
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        q.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchDate =
        !this.filterDate || q.tanggal.startsWith(this.filterDate);
      return matchSearch && matchDate;
    });
  }

  /** ✅ Filter SO dengan search & tanggal */
  getFilteredOrders() {
    return this.salesOrders.filter((so) => {
      const matchSearch =
        !this.searchTerm ||
        so.nomor_order.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        so.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchDate =
        !this.filterDate || so.tanggal.startsWith(this.filterDate);
      return matchSearch && matchDate;
    });
  }

  /** ✅ Pagination */
  getPages(data: any[]) {
    return Array(Math.ceil(data.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);
  }
}
