import { Component, OnInit } from "@angular/core";
import { InventoryReportService } from "../laporan-persediaan/inventory-report.service";
import { saveAs } from "file-saver";
import { NbToastrService } from "@nebular/theme";

@Component({
  selector: "app-inventory-report",
  templateUrl: "./inventory-report.component.html",
  styleUrls: ["./inventory-report.component.scss"],
})
export class InventoryReportComponent implements OnInit {
  laporan: any[] = [];
  paginatedLaporan: any[] = [];

  // Loading & spinner flags
  loading = false;
  loadingFilter = false;
  loadingClosing = false;
  loadingCancelClosing = false;
  loadingExport = false;
  loadingTemplate = false;
  loadingImport = false;

  filterType: string = "month"; // default ke bulan biar bisa closing
  tanggalFilter: string = new Date().toISOString().split("T")[0];
  selectedMonth: string = "";
  startDate: string = "";
  endDate: string = "";

  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  isClosed = false; // <== untuk disable tombol closing dan muncul tombol batal closing

  total = {
    saldo_awal: { qty: 0, total: 0 },
    penerimaan: { qty: 0, total: 0, retur_supplier: 0, selisih_so: 0 },
    pengeluaran: { qty: 0, total: 0, retur_pembeli: 0, selisih_so: 0 },
    sisa_stok: { qty: 0, total: 0 },
  };

  constructor(
    private inventoryService: InventoryReportService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  private calculateTotals() {
    this.total = {
      saldo_awal: { qty: 0, total: 0 },
      penerimaan: { qty: 0, total: 0, retur_supplier: 0, selisih_so: 0 },
      pengeluaran: { qty: 0, total: 0, retur_pembeli: 0, selisih_so: 0 },
      sisa_stok: { qty: 0, total: 0 },
    };

    for (const row of this.laporan) {
      this.total.saldo_awal.qty += Number(row.saldo_awal.qty) || 0;
      this.total.saldo_awal.total += Number(row.saldo_awal.total) || 0;

      this.total.penerimaan.qty += Number(row.penerimaan.qty) || 0;
      this.total.penerimaan.total += Number(row.penerimaan.total) || 0;
      this.total.penerimaan.retur_supplier +=
        Number(row.penerimaan.retur_supplier) || 0;
      this.total.penerimaan.selisih_so +=
        Number(row.penerimaan.selisih_so) || 0;

      this.total.pengeluaran.qty += Number(row.pengeluaran.qty) || 0;
      this.total.pengeluaran.total += Number(row.pengeluaran.total) || 0;
      this.total.pengeluaran.retur_pembeli +=
        Number(row.pengeluaran.retur_pembeli) || 0;
      this.total.pengeluaran.selisih_so +=
        Number(row.pengeluaran.selisih_so) || 0;

      this.total.sisa_stok.qty += Number(row.sisa_stok.qty) || 0;
      this.total.sisa_stok.total += Number(row.sisa_stok.total) || 0;
    }
  }

  loadReport() {
    this.loadingFilter = true;

    const params: any = {};
    if (this.filterType === "date") {
      params.date = this.tanggalFilter;
    } else if (this.filterType === "month") {
      params.periode = this.selectedMonth;
    } else if (this.filterType === "range") {
      params.start_date = this.startDate;
      params.end_date = this.endDate;
    }

    this.inventoryService.getStockReport(params).subscribe({
      next: (res) => {
        this.laporan = res;
        this.calculateTotals();
        this.totalPages = Math.ceil(this.laporan.length / this.itemsPerPage);
        this.changePage(1);
        this.loadingFilter = false;

        // Cek status closing jika filter bulan
        if (this.filterType === "month" && this.selectedMonth) {
          this.checkClosingStatus(this.selectedMonth);
        } else {
          this.isClosed = false;
        }
      },
      error: () => {
        this.loadingFilter = false;
        this.toastr.danger("Gagal memuat laporan persediaan", "Error");
      },
    });
  }

  checkClosingStatus(periode: string) {
    this.inventoryService.checkClosingStatus(periode).subscribe((res) => {
      this.isClosed = res.is_closed;
    });
  }

  onImport(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.selectedMonth) {
      this.toastr.warning("Pilih periode bulan terlebih dahulu", "Peringatan");
      return;
    }

    this.loadingImport = true;
    this.inventoryService
      .importStockReport(file, this.selectedMonth)
      .subscribe({
        next: () => {
          this.toastr.success("Import saldo awal berhasil", "Sukses");
          this.loadReport();
          this.loadingImport = false;
        },
        error: () => {
          this.toastr.danger("Gagal import data", "Error");
          this.loadingImport = false;
        },
      });
  }

  exportReport() {
    const params: any = {};
    if (this.filterType === "date") {
      params.date = this.tanggalFilter;
    } else if (this.filterType === "month") {
      params.periode = this.selectedMonth;
    } else if (this.filterType === "range") {
      params.start_date = this.startDate;
      params.end_date = this.endDate;
    }

    this.loadingExport = true;
    this.inventoryService.exportStockReport(params).subscribe({
      next: (res) => {
        saveAs(res, "laporan-persediaan.xlsx");
        this.loadingExport = false;
      },
      error: () => {
        this.toastr.danger("Gagal ekspor laporan", "Error");
        this.loadingExport = false;
      },
    });
  }

  downloadTemplate() {
    this.loadingTemplate = true;
    this.inventoryService.downloadTemplate().subscribe({
      next: (res) => {
        saveAs(res, "template-laporan-persediaan.xlsx");
        this.loadingTemplate = false;
      },
      error: () => {
        this.toastr.danger("Gagal download template", "Error");
        this.loadingTemplate = false;
      },
    });
  }

  closingStock() {
    if (!this.selectedMonth) {
      this.toastr.warning("Pilih periode bulan terlebih dahulu", "Peringatan");
      return;
    }

    if (
      confirm(
        `Yakin ingin melakukan closing stok untuk periode ${this.selectedMonth}?`
      )
    ) {
      this.loadingClosing = true;
      this.inventoryService.closingStock(this.selectedMonth).subscribe({
        next: () => {
          this.toastr.success("Closing stok berhasil diproses", "Sukses");
          this.checkClosingStatus(this.selectedMonth);
          this.loadReport();
          this.loadingClosing = false;
        },
        error: () => {
          this.toastr.danger("Gagal melakukan closing stok", "Error");
          this.loadingClosing = false;
        },
      });
    }
  }

  cancelClosing() {
    if (!this.selectedMonth) {
      this.toastr.warning("Pilih periode bulan terlebih dahulu", "Peringatan");
      return;
    }

    if (
      confirm(
        `Yakin ingin membatalkan closing stok untuk periode ${this.selectedMonth}?`
      )
    ) {
      this.loadingCancelClosing = true;
      this.inventoryService.cancelClosingStock(this.selectedMonth).subscribe({
        next: () => {
          this.toastr.success("Batal closing stok berhasil diproses", "Sukses");
          this.checkClosingStatus(this.selectedMonth);
          this.loadReport();
          this.loadingCancelClosing = false;
        },
        error: () => {
          this.toastr.danger("Gagal membatalkan closing stok", "Error");
          this.loadingCancelClosing = false;
        },
      });
    }
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLaporan = this.laporan.slice(start, end);
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.totalPages = Math.ceil(this.laporan.length / this.itemsPerPage);
    this.changePage(1);
  }

  onFilterTypeChange(type: string) {
    this.filterType = type;
    this.loadReport();
  }

  getTotal(section: string, key: string): number | string {
    if (!this.laporan || this.laporan.length === 0) return "-";

    const total = this.laporan.reduce((sum, item) => {
      const val = item[section]?.[key] ?? 0;
      const numVal = Number(val);
      return sum + (isNaN(numVal) ? 0 : numVal);
    }, 0);

    // Jika total 0, tampilkan tanda '-'
    return total === 0 ? "-" : total;
  }
}
