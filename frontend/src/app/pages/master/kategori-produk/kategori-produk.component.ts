import { Component, OnInit } from "@angular/core";
import { KategoriProdukService } from "./kategori-produk.service";
import { NbDialogService } from "@nebular/theme";
import { KategoriProdukFormComponent } from "./kategori-produk-form.component";

@Component({
  selector: "app-kategori-produk",
  templateUrl: "./kategori-produk.component.html",
  styleUrls: ["./kategori-produk.component.scss"],
})
export class KategoriProdukComponent implements OnInit {
  searchTerm: string = "";
  kategoriList: any[] = [];
  filteredKategoriList: any[] = [];

  constructor(
    private kategoriService: KategoriProdukService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /** Ambil data dari backend dan filter langsung */
  loadData(): void {
    this.kategoriService.getAll().subscribe((data) => {
      this.kategoriList = data || [];
      this.applyFilter();
    });
  }

  /** Filter berdasarkan pencarian */
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredKategoriList = this.kategoriList.filter(
      (k) =>
        k.nama_kategori?.toLowerCase().includes(term) ||
        k.kode_kategori?.toLowerCase().includes(term)
    );
  }

  /** Buka form tambah/edit */
  openForm(data: any = null): void {
    this.dialogService
      .open(KategoriProdukFormComponent, {
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

  /** Hapus kategori */
  delete(id: number): void {
    if (confirm("Yakin ingin menghapus kategori ini?")) {
      this.kategoriService.delete(id).subscribe(() => this.loadData());
    }
  }
}
