import { Component, OnInit } from "@angular/core";
import { NbToastrService, NbDialogService } from "@nebular/theme";
import { SalesOrderService } from "./sales-order.service";
import { forkJoin } from "rxjs";
import { VerifyDialogComponent } from "./verify-dialog.component";
import { SalesOrderFormDialogComponent } from "./sales-order-form-dialog.component";

@Component({
  selector: "app-sales-order",
  templateUrl: "./sales-order.component.html",
  styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent implements OnInit {
  salesOrders: any[] = [];
  searchTerm: string = "";
  filterStatus: string = "";
  fromDate: string = "";
  toDate: string = "";

  isRefreshing = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;

  selectAll = false;
  selectedOrders: any[] = [];

  activeTab: string = "sq"; // default tab (SO dari SQ)

  constructor(
    private orderService: SalesOrderService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  /** ✅ Ambil SQ draft & SO approved */
  loadSalesOrders() {
    this.isRefreshing = true;
    forkJoin({
      drafts: this.orderService.getDraftQuotations(),
      orders: this.orderService.getOrders(),
    }).subscribe({
      next: ({ drafts, orders }) => {
        this.salesOrders = [
          // SQ draft
          ...drafts.map((d: any) => ({
            ...d,
            source: "sq", // ✅ Biar masuk tab SQ
            type: "draft", // status draft
            nomor_order: null,
          })),
          // SO approved
          ...orders.map((o: any) => ({
            ...o,
            source: o.id_quotation ? "sq" : "manual", // sq/manual sesuai asal
            type: "approved",
            nomor_quotation: o.quotation?.nomor_quotation || "-",
          })),
        ];
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data Sales Order & SQ Draft", "Error");
      },
    });
  }

  /** ✅ Buka dialog verifikasi */
  openVerifyDialog(orders: any[]) {
    this.dialogService
      .open(VerifyDialogComponent, { context: { orders } })
      .onClose.subscribe((result) => {
        if (result) {
          this.orderService
            .bulkVerify({
              ids: result.ids,
              products: result.products,
            })
            .subscribe({
              next: () => {
                this.toastr.success(
                  "Semua SQ terpilih berhasil diverifikasi",
                  "Sukses"
                );
                this.refreshData();
                this.selectedOrders = [];
                this.selectAll = false;
              },
              error: () =>
                this.toastr.danger("Gagal verifikasi bulk SQ", "Error"),
            });
        }
      });
  }

  /** ✅ Approve SQ jadi SO (satuan) */
  approveOrder(id: number) {
    const order = this.salesOrders.find((o) => o.id === id);
    if (order) {
      this.openVerifyDialog([order]);
    }
  }

  /** ✅ Reject SQ */
  rejectOrder(id: number) {
    if (confirm("Yakin ingin reject SQ ini?")) {
      this.orderService.rejectQuotation(id).subscribe({
        next: () => {
          this.toastr.warning("SQ berhasil di-reject", "Info");
          this.refreshData();
        },
        error: () => this.toastr.danger("Gagal reject SQ", "Error"),
      });
    }
  }

  /** ✅ Batalkan approval (Cancel SO) */
  cancelOrder(id: number) {
    if (confirm("Yakin ingin membatalkan Sales Order ini?")) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => {
          this.toastr.info("Sales Order berhasil dibatalkan", "Info");
          this.refreshData();
        },
        error: () =>
          this.toastr.danger("Gagal membatalkan Sales Order", "Error"),
      });
    }
  }

  /** ✅ Bulk approve (verifikasi beberapa SQ) */
  approveSelectedOrders() {
    if (this.selectedOrders.length === 0) {
      this.toastr.warning("Tidak ada SQ yang dipilih", "Info");
      return;
    }
    this.openVerifyDialog(this.selectedOrders);
  }

  /** ✅ Cetak PDF */
  printPdf(id: number) {
    this.orderService.printOrder(id).subscribe((res) => {
      const blob = new Blob([res], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    });
  }

  /** ✅ Refresh data */
  refreshData() {
    this.loadSalesOrders();
  }

  /** ✅ Hitung total SQ atau SO */
  getQuotationTotal(details: any[]): number {
    return (
      details?.reduce((sum, d) => sum + (d.qty || 0) * (d.harga || 0), 0) || 0
    );
  }

  /** ✅ Filter data berdasarkan tab */
  getFilteredOrders(source: string) {
    return this.salesOrders.filter((order) => {
      const matchSource = order.source === source; // ubah ini

      const matchSearch =
        !this.searchTerm ||
        order.nomor_order
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        order.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        order.quotation?.pelanggan?.nama_pelanggan
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchStatus =
        !this.filterStatus || order.status === this.filterStatus;

      const matchDate =
        (!this.fromDate ||
          new Date(order.tanggal) >= new Date(this.fromDate)) &&
        (!this.toDate || new Date(order.tanggal) <= new Date(this.toDate));

      return matchSource && matchSearch && matchStatus && matchDate;
    });
  }

  /** ✅ Pagination */
  getPages(data: any[]) {
    return Array(Math.ceil(data.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);
  }

  toggleSelectAll() {
    this.getFilteredOrders(this.activeTab).forEach((order) => {
      if (order.status === "draft") {
        order.selected = this.selectAll;
      }
    });
    this.updateSelectedOrders();
  }

  updateSelectedOrders() {
    this.selectedOrders = this.getFilteredOrders(this.activeTab).filter(
      (o) => o.selected
    );
  }

  /** ✅ Buka dialog buat SO manual */
  openCreateOrderDialog(order?: any) {
    this.dialogService
      .open(SalesOrderFormDialogComponent, {
        context: order ? { order } : {},
      })
      .onClose.subscribe((result) => {
        if (result) {
          // Hanya refresh data setelah create/update sukses di dialog
          this.toastr.success(
            order
              ? "Sales Order manual berhasil diperbarui"
              : "Sales Order manual berhasil dibuat",
            "Sukses"
          );
          this.refreshData();
        }
      });
  }

  /** ✅ Ganti tab manual */
  switchTab(tab: string) {
    this.activeTab = tab;
    this.selectAll = false;
    this.selectedOrders = [];
    this.searchTerm = "";
    this.filterStatus = "";
    this.fromDate = "";
    this.toDate = "";
  }
}
