import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { CoaService } from "./coa.service";
import { NbDialogService } from "@nebular/theme";
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

  @ViewChild("fileInput", { static: false })
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private coaService: CoaService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.coaService.getAll().subscribe((res) => {
      this.data = res;

      // Ambil daftar unik kategori_akun untuk filter dropdown
      this.kategoriList = Array.from(
        new Set(res.map((d) => d.kategori_akun).filter(Boolean))
      );

      this.applyFilterSort();
    });
  }

  openForm(id?: number) {
    this.dialogService
      .open(CoaFormDialogComponent, {
        context: { id },
        dialogClass: "wide-dialog",
      })
      .onClose.subscribe((result) => {
        if (result) this.loadData();
      });
  }

  delete(id: number) {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      this.coaService.delete(id).subscribe(() => this.loadData());
    }
  }

  // 🔍 Filter + 🔃 Sort
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
        const valA = a[this.sortField]?.toLowerCase() || "";
        const valB = b[this.sortField]?.toLowerCase() || "";
        return this.sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    this.filteredData = result;
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    this.changePage(this.currentPage);
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

  // 📥 Import Excel
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
          alert("✅ Import berhasil");
          this.loadData();
        },
        error: () => alert("❌ Import gagal. Periksa format file."),
      });
    }
  }

  // 📤 Download Template
  downloadTemplate() {
    this.coaService.downloadTemplate().subscribe((blob: Blob) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "template_coa.xlsx";
      link.click();
    });
  }
}
