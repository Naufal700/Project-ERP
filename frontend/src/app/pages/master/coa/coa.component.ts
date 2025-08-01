import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { CoaService } from "./coa.service";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { CoaFormDialogComponent } from "./coa-form-dialog.component";

@Component({
  selector: "app-coa",
  templateUrl: "./coa.component.html",
  styleUrls: ["./coa.component.scss"],
})
export class CoaComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  paginatedData: any[] = [];

  searchTerm = "";
  sortField: string = "";
  sortDirection: "asc" | "desc" = "asc";

  filterKategori: string = "";
  kategoriList: string[] = [];

  itemsPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  isRefreshing: boolean = false;

  @ViewChild("fileInput", { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private coaService: CoaService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // 🔄 Load awal
  loadData() {
    this.isRefreshing = true;
    this.coaService.getAll().subscribe({
      next: (res) => {
        this.data = [...res];
        this.kategoriList = Array.from(
          new Set(res.map((d) => d.kategori_akun).filter(Boolean))
        );
        this.applyFilterSort();
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data COA", "Error");
      },
    });
  }

  // 🔄 Refresh data manual
  refreshData() {
    this.isRefreshing = true;
    this.coaService.getAll().subscribe({
      next: (res) => {
        this.data = [...res];
        this.kategoriList = Array.from(
          new Set(res.map((d) => d.kategori_akun).filter(Boolean))
        );
        this.currentPage = 1;
        this.applyFilterSort();
        this.isRefreshing = false;
        this.toastr.success("Data COA berhasil diperbarui", "Sukses");
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data COA", "Error");
      },
    });
  }

  openForm(id?: number) {
    this.dialogService
      .open(CoaFormDialogComponent, {
        context: { id },
        dialogClass: "wide-dialog",
      })
      .onClose.subscribe((result) => {
        if (result) {
          this.toastr.success("Data COA berhasil disimpan", "Sukses");
          this.loadData();
        }
      });
  }

  delete(id: number) {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      this.coaService.delete(id).subscribe({
        next: () => {
          this.toastr.success("Data COA berhasil dihapus", "Sukses");
          this.loadData();
        },
        error: () => this.toastr.danger("Gagal menghapus data COA", "Error"),
      });
    }
  }

  applyFilterSort() {
    let result = [...this.data];
    const term = this.searchTerm.toLowerCase();

    if (term) {
      result = result.filter(
        (coa) =>
          coa.kode_akun?.toLowerCase().includes(term) ||
          coa.nama_akun?.toLowerCase().includes(term)
      );
    }

    if (this.filterKategori) {
      result = result.filter(
        (coa) =>
          coa.kategori_akun?.toLowerCase() === this.filterKategori.toLowerCase()
      );
    }

    if (this.sortField) {
      result.sort((a, b) => {
        const valA = a[this.sortField]?.toString().toLowerCase() || "";
        const valB = b[this.sortField]?.toString().toLowerCase() || "";
        return this.sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    this.filteredData = result;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.changePage(1);
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
    }
    this.applyFilterSort();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.applyFilterSort();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      this.coaService.importExcel(formData).subscribe({
        next: () => {
          this.toastr.success("Berhasil import COA!", "Sukses");
          this.loadData();
        },
        error: () =>
          this.toastr.danger(
            "Gagal import file COA. Periksa format file.",
            "Error"
          ),
      });
    }
  }

  downloadTemplate() {
    this.coaService.downloadTemplate().subscribe({
      next: (blob: Blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "template_coa.xlsx";
        link.click();
        this.toastr.success("Template COA berhasil diunduh", "Sukses");
      },
      error: () => this.toastr.danger("Gagal mengunduh template COA", "Error"),
    });
  }
}
