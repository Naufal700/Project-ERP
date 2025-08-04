import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { JurnalUmumService } from "./jurnal-umum.service";
import { JurnalFormDialogComponent } from "./jurnal-form-dialog.component";
import { JurnalDetailDialogComponent } from "./jurnal-detail-dialog.component";

@Component({
  selector: "app-jurnal-umum",
  templateUrl: "./jurnal-umum.component.html",
  styleUrls: ["./jurnal-umum.component.scss"],
})
export class JurnalUmumComponent implements OnInit {
  jurnals: any[] = [];
  filter = {
    from_date: "",
    to_date: "",
    search: "",
  };

  page = 1;
  lastPage = 1;
  perPage = 10;
  loading = false;

  constructor(
    private service: JurnalUmumService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  /**
   * Ambil data jurnal dengan pagination dan filter
   */
  loadData(page: number = 1) {
    this.page = page;
    this.loading = true;

    this.service.list(this.page, this.filter, this.perPage).subscribe({
      next: (res: any) => {
        this.jurnals = res.data || [];
        this.lastPage = res.last_page || 1;
        this.loading = false;
      },
      error: () => {
        this.toastr.danger("Gagal memuat data jurnal", "Error");
        this.loading = false;
      },
    });
  }

  /**
   * Terapkan filter pencarian
   */
  applyFilter() {
    this.loadData(1);
  }

  /**
   * Reset filter
   */
  resetFilter() {
    this.filter = { from_date: "", to_date: "", search: "" };
    this.loadData(1);
  }

  /**
   * Download template Excel untuk jurnal
   */
  downloadTemplate() {
    this.service.downloadTemplate().subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-jurnal.xlsx";
      a.click();
    });
  }

  /**
   * Export data jurnal ke Excel
   */
  exportExcel() {
    this.service.exportExcel(this.filter).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement("a");
      a.href = url;
      a.download = "jurnal.xlsx";
      a.click();
    });
  }

  /**
   * Import jurnal dari file Excel
   */
  importExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.service.importExcel(formData).subscribe({
      next: () => {
        this.toastr.success("Import berhasil", "Sukses");
        this.loadData();
      },
      error: () => {
        this.toastr.danger("Gagal import data", "Error");
      },
    });
  }

  /**
   * Buka form tambah jurnal
   */
  openAddDialog() {
    this.dialogService
      .open(JurnalFormDialogComponent)
      .onClose.subscribe((res) => {
        if (res === "success") this.loadData();
      });
  }

  /**
   * Lihat detail jurnal
   */

  openDetail(jurnal: any) {
    this.dialogService.open(JurnalDetailDialogComponent, {
      context: { jurnal },
    });
  }
  openEditDialog(jurnal: any) {
    this.dialogService
      .open(JurnalFormDialogComponent, {
        context: { jurnal } as any, // Casting ke any supaya tidak error
      })
      .onClose.subscribe((res) => {
        if (res === "success") this.loadData(this.page);
      });
  }

  /**
   * Hapus jurnal
   */
  deleteJurnal(id: number) {
    if (confirm("Yakin hapus jurnal ini?")) {
      this.service.delete(id).subscribe({
        next: () => {
          this.toastr.success("Jurnal berhasil dihapus", "Sukses");
          this.loadData();
        },
        error: () => {
          this.toastr.danger("Gagal hapus jurnal", "Error");
        },
      });
    }
  }
  getTotal(details: any[], type: "debit" | "kredit"): number {
    if (!details || !Array.isArray(details)) return 0;
    return details
      .filter((d) => d.jenis?.toLowerCase().trim() === type) // aman untuk perbedaan format
      .reduce((sum, d) => sum + (parseFloat(d.nominal) || 0), 0); // pastikan nominal jadi angka
  }
}
