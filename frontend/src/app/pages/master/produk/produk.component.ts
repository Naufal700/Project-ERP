import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { ProdukService } from "./produk.service";
import { ProdukFormComponent } from "./produk-form..component";

@Component({
  selector: "app-produk",
  templateUrl: "./produk.component.html",
  styleUrls: ["./produk.component.scss"],
})
export class ProdukComponent implements OnInit {
  produkList: any[] = [];
  searchTerm: string = "";

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private produkService: ProdukService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.produkService.getAll().subscribe({
      next: (data) => {
        this.produkList = data;
        this.currentPage = 1; // reset page ketika data berubah
        this.calculateTotalPages();
      },
      error: (err) => console.error("❌ Gagal mengambil data produk:", err),
    });
  }

  get filteredProdukList(): any[] {
    const term = this.searchTerm.toLowerCase();

    const filtered = this.produkList.filter(
      (p) =>
        p.nama_produk?.toLowerCase().includes(term) ||
        p.kode_produk?.toLowerCase().includes(term)
    );

    filtered.sort((a, b) => {
      const numA = parseInt(a.kode_produk?.split("-")[1] || "0", 10);
      const numB = parseInt(b.kode_produk?.split("-")[1] || "0", 10);
      return numA - numB;
    });

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  calculateTotalPages(): void {
    const filtered = this.produkList.filter((p) =>
      p.nama_produk?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
  }

  changePage(page: number, event?: Event): void {
    if (event) event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changeItemsPerPage(perPage: number): void {
    this.itemsPerPage = perPage;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  openForm(data: any = null): void {
    this.dialogService
      .open(ProdukFormComponent, {
        context: {
          data: data || {},
          isEdit: !!data,
        },
        dialogClass: "wide-dialog",
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((result) => {
        if (result === "success") this.loadData();
      });
  }

  delete(id: number): void {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      this.produkService.delete(id).subscribe(() => this.loadData());
    }
  }

  triggerFileInput(): void {
    const input = document.querySelector<HTMLInputElement>("input[type=file]");
    input?.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.produkService.import(formData).subscribe({
      next: () => {
        alert("✅ Berhasil import!");
        this.loadData();
      },
      error: (err) => {
        console.error("❌ Gagal import:", err);
        alert("Gagal import file");
      },
    });
  }

  downloadTemplate(): void {
    this.produkService.downloadTemplate().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_produk.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
