import { Component, OnInit } from "@angular/core";
import { DeliveryOrderService } from "./delivery-order.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { DODetailDialogComponent } from "./do-detail-dialog.component";

@Component({
  selector: "app-do-list",
  templateUrl: "./delivery-order.component.html",
  styleUrls: ["./delivery-order.component.scss"],
})
export class DeliveryOrderComponent implements OnInit {
  deliveryOrders: any[] = [];
  salesOrdersForDO: any[] = [];
  filteredSalesOrdersForDO: any[] = [];
  selectedDOs: any[] = [];

  isLoadingDO = false;
  isLoadingSO = false;
  isRefreshing = false;

  activeTab: string = "so";

  // Filter & pagination
  searchTermSO: string = "";
  searchTerm: string = "";
  fromDate: Date | null = null;
  toDate: Date | null = null;
  filterStatus: string = "";
  currentPage: number = 1;
  itemsPerPage: number = 10;
  selectAll = false;

  constructor(
    private doService: DeliveryOrderService,
    private toastr: NbToastrService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadDO();
    this.loadSalesOrdersForDO();
  }

  // Ambil semua Delivery Order
  loadDO() {
    this.isLoadingDO = true;
    this.doService.getDeliveryOrders().subscribe({
      next: (data) => {
        this.deliveryOrders = data;
        this.isLoadingDO = false;
      },
      error: () => (this.isLoadingDO = false),
    });
  }

  // Ambil semua SO yang siap untuk dibuat DO
  loadSalesOrdersForDO() {
    this.isLoadingSO = true;
    this.doService.getSalesOrdersForDO().subscribe({
      next: (data) => {
        this.salesOrdersForDO = data;
        this.filteredSalesOrdersForDO = data;
        this.isLoadingSO = false;
      },
      error: () => (this.isLoadingSO = false),
    });
  }

  // Refresh data
  refreshDO() {
    this.isRefreshing = true;
    this.loadDO();
    this.loadSalesOrdersForDO();
    setTimeout(() => (this.isRefreshing = false), 500);
  }

  // Buat DO dari SO
  createDO(so: any) {
    this.doService.createDO({ sales_order_id: so.id, gudang_id: 1 }).subscribe({
      next: () => {
        this.toastr.success("Delivery Order berhasil dibuat!", "Sukses");
        this.loadDO();
        this.loadSalesOrdersForDO();
        this.activeTab = "do";
      },
      error: () => this.toastr.danger("Gagal membuat Delivery Order", "Error"),
    });
  }

  // Filter SO
  filterSalesOrdersForDO() {
    this.filteredSalesOrdersForDO = this.salesOrdersForDO.filter((so) => {
      return (
        !this.searchTermSO ||
        so.nomor_order
          ?.toLowerCase()
          .includes(this.searchTermSO.toLowerCase()) ||
        so.pelanggan?.nama
          ?.toLowerCase()
          .includes(this.searchTermSO.toLowerCase())
      );
    });
  }

  // Filter DO
  getFilteredDOs() {
    return this.deliveryOrders.filter((data) => {
      const matchSearch =
        !this.searchTerm ||
        data.no_do?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        data.sales_order?.nomor_order
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        data.pelanggan?.nama
          ?.toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchStatus =
        !this.filterStatus || data.status === this.filterStatus;

      const matchDate =
        (!this.fromDate || new Date(data.tanggal) >= new Date(this.fromDate)) &&
        (!this.toDate || new Date(data.tanggal) <= new Date(this.toDate));

      return matchSearch && matchStatus && matchDate;
    });
  }

  // Checkbox select all
  toggleSelectAll() {
    this.deliveryOrders.forEach((doItem) => (doItem.selected = this.selectAll));
    this.updateSelectedDOs();
  }

  updateSelectedDOs() {
    this.selectedDOs = this.deliveryOrders.filter((d) => d.selected);
  }

  // Approve DO
  approveDO(id: number) {
    this.doService.approveDO(id).subscribe({
      next: () => {
        this.toastr.success("Delivery Order disetujui!", "Sukses");
        this.loadDO();
      },
      error: () => this.toastr.danger("Gagal approve DO", "Error"),
    });
  }

  // Ship DO
  shipDO(id: number) {
    this.doService.shipDO(id).subscribe({
      next: () => {
        this.toastr.success("Delivery Order berhasil dikirim!", "Sukses");
        this.loadDO();
      },
      error: () => this.toastr.danger("Gagal mengirim DO", "Error"),
    });
  }

  // Cancel DO
  // Cancel DO
  cancelDO(id: number) {
    this.doService.cancelDO(id).subscribe({
      next: () => {
        this.toastr.warning("Delivery Order dibatalkan dan dihapus!", "Info");
        this.loadDO();
        this.loadSalesOrdersForDO();
        this.activeTab = "so";
      },
      error: () => this.toastr.danger("Gagal membatalkan DO", "Error"),
    });
  }

  // Buka dialog detail DO
  openDetailDialog(doId: number) {
    this.dialogService
      .open(DODetailDialogComponent, { context: { id: doId } })
      .onClose.subscribe(() => {
        this.loadDO();
      });
  }

  // Pagination
  getPages(data: any[]) {
    return Array(Math.ceil(data.length / this.itemsPerPage));
  }
}
