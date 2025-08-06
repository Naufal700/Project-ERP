import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { JurnalUmumService } from "./jurnal-umum.service";
import { JurnalFormDialogComponent } from "./jurnal-form-dialog.component";
import { JurnalDetailDialogComponent } from "./jurnal-detail-dialog.component";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-jurnal-umum",
  templateUrl: "./jurnal-umum.component.html",
  styleUrls: ["./jurnal-umum.component.scss"],
})
export class JurnalUmumComponent implements OnInit {
  jurnals: any[] = [];
  originalJurnals: any[] = []; // Backup untuk filter frontend
  filter = {
    from_date: "",
    to_date: "",
    search: "",
  };

  page = 1;
  lastPage = 1;
  perPage = 10;
  loading = false;

  totalDebit = 0;
  totalKredit = 0;

  public searchSubject = new Subject<string>();

  constructor(
    private service: JurnalUmumService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit() {
    this.setDefaultDate();

    // Debounce search hanya untuk filter frontend
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterJurnalsFrontend();
    });

    this.loadData();
  }

  /**
   * Set tanggal default ke bulan berjalan
   */
  private setDefaultDate() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.filter.from_date = this.formatDateLocal(firstDay);
    this.filter.to_date = this.formatDateLocal(now);
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Ambil data jurnal dari backend
   */
  loadData(page: number = 1) {
    this.page = page;
    this.loading = true;

    const filterPayload = {
      search: "", // search backend di-disable, karena frontend search
      from_date: this.filter.from_date
        ? this.formatDateLocal(new Date(this.filter.from_date))
        : "",
      to_date: this.filter.to_date
        ? this.formatDateLocal(new Date(this.filter.to_date))
        : "",
    };

    this.service.list(this.page, filterPayload, this.perPage).subscribe({
      next: (res: any) => {
        this.jurnals = res.data || [];
        this.originalJurnals = [...this.jurnals]; // Backup data original untuk filter frontend
        this.lastPage = res.last_page || 1;
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.toastr.danger("Gagal memuat data jurnal", "Error");
        this.loading = false;
      },
    });
  }

  /**
   * Hitung total debit & kredit
   */
  private calculateTotals() {
    this.totalDebit = this.jurnals.reduce(
      (sum, j) => sum + this.getTotal(j.details, "debit"),
      0
    );
    this.totalKredit = this.jurnals.reduce(
      (sum, j) => sum + this.getTotal(j.details, "kredit"),
      0
    );
  }

  /**
   * Event untuk search realtime (frontend)
   */
  onSearchChange(value: string) {
    this.filter.search = value;
    this.searchSubject.next(value);
  }

  /**
   * Filter data di frontend
   */
  private filterJurnalsFrontend() {
    if (!this.filter.search) {
      this.jurnals = [...this.originalJurnals];
    } else {
      const term = this.filter.search.toLowerCase();
      this.jurnals = this.originalJurnals.filter(
        (j) =>
          j.kode_jurnal?.toLowerCase().includes(term) ||
          j.keterangan?.toLowerCase().includes(term) ||
          j.details?.some(
            (d: any) =>
              d.coa?.nama_akun?.toLowerCase().includes(term) ||
              d.coa?.kode_akun?.toLowerCase().includes(term)
          )
      );
    }
    this.page = 1; // reset pagination setiap kali search
    this.calculateTotals();
  }

  /**
   * Terapkan filter tanggal (reload API)
   */
  applyFilter() {
    this.loadData(1);
  }

  /**
   * Reset filter ke default
   */
  resetFilter() {
    this.filter.search = "";
    this.setDefaultDate();
    this.loadData(1);
  }

  /**
   * Download template Excel
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
   * Export Excel
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
   * Import Excel
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

  /**
   * Edit jurnal
   */
  openEditDialog(jurnal: any) {
    this.dialogService
      .open(JurnalFormDialogComponent, { context: { jurnal } as any })
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

  /**
   * Hitung total per jurnal
   */
  getTotal(details: any[], type: "debit" | "kredit"): number {
    if (!details || !Array.isArray(details)) return 0;
    return details
      .filter((d) => d.jenis?.toLowerCase().trim() === type)
      .reduce((sum, d) => sum + (parseFloat(d.nominal) || 0), 0);
  }

  /**
   * Ambil data jurnals untuk halaman aktif (pagination frontend)
   */
  getPagedJurnals(): any[] {
    const start = (this.page - 1) * this.perPage;
    return this.jurnals.slice(start, start + this.perPage);
  }
}
