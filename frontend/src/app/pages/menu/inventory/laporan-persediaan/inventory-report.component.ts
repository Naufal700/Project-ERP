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
  loading = false;

  filterType: string = "month"; // default ke bulan biar bisa closing
  tanggalFilter: string = new Date().toISOString().split("T")[0];
  selectedMonth: string = "";
  startDate: string = "";
  endDate: string = "";

  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;
  isClosed = false; // <== TAMBAH untuk disable tombol closing

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
      this.total.saldo_awal.qty += row.saldo_awal.qty;
      this.total.saldo_awal.total += row.saldo_awal.total;

      this.total.penerimaan.qty += row.penerimaan.qty;
      this.total.penerimaan.total += row.penerimaan.total;
      this.total.penerimaan.retur_supplier +=
        row.penerimaan.retur_supplier || 0;
      this.total.penerimaan.selisih_so += row.penerimaan.selisih_so || 0;

      this.total.pengeluaran.qty += row.pengeluaran.qty;
      this.total.pengeluaran.total += row.pengeluaran.total;
      this.total.pengeluaran.retur_pembeli +=
        row.pengeluaran.retur_pembeli || 0;
      this.total.pengeluaran.selisih_so += row.pengeluaran.selisih_so || 0;

      this.total.sisa_stok.qty += row.sisa_stok.qty;
      this.total.sisa_stok.total += row.sisa_stok.total;
    }
  }

  loadReport() {
    this.loading = true;

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
        this.loading = false;

        // ✅ cek status closing jika filter bulan
        if (this.filterType === "month" && this.selectedMonth) {
          this.checkClosingStatus(this.selectedMonth);
        }
      },
      error: () => {
        this.loading = false;
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
    if (file) {
      this.inventoryService.importStockReport(file).subscribe(() => {
        this.toastr.success("Import saldo awal berhasil", "Sukses");
        this.loadReport();
      });
    }
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

    this.inventoryService.exportStockReport(params).subscribe((res) => {
      saveAs(res, "laporan-persediaan.xlsx");
    });
  }

  downloadTemplate() {
    this.inventoryService.downloadTemplate().subscribe((res) => {
      saveAs(res, "template-laporan-persediaan.xlsx");
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
      this.inventoryService.closingStock(this.selectedMonth).subscribe({
        next: () => {
          this.toastr.success("Closing stok berhasil diproses", "Sukses");
          this.checkClosingStatus(this.selectedMonth); // update tombol closing
          this.loadReport(); // refresh laporan
        },
        error: () => {
          this.toastr.danger("Gagal melakukan closing stok", "Error");
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
}
