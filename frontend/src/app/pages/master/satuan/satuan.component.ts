import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { SatuanService } from "./satuan.service";
import { SatuanFormComponent } from "./satuan-form.component";

@Component({
  selector: "app-satuan",
  templateUrl: "./satuan.component.html",
  styleUrls: ["./satuan.component.scss"],
})
export class SatuanComponent implements OnInit {
  satuanList: any[] = [];
  searchTerm: string = "";

  constructor(
    private satuanService: SatuanService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  /** Ambil data satuan dari backend */
  loadData(): void {
    this.satuanService.getAll().subscribe({
      next: (res) => {
        this.satuanList = Array.isArray(res) ? res : [];
      },
      error: (err) => {
        console.error("❌ Gagal memuat data satuan:", err);
      },
    });
  }

  /** Filter satuan berdasarkan pencarian */
  get filteredSatuanList(): any[] {
    if (!this.searchTerm) return this.satuanList;
    const term = this.searchTerm.toLowerCase();
    return this.satuanList.filter(
      (s) =>
        s.nama_satuan?.toLowerCase().includes(term) ||
        s.kode_satuan?.toLowerCase().includes(term)
    );
  }

  /** Buka form tambah/edit satuan */
  openForm(data: any = null): void {
    this.dialogService
      .open(SatuanFormComponent, {
        context: {
          data: data || {},
          isEdit: !!(data && data.id),
        },
        dialogClass: "wide-dialog",
        closeOnBackdropClick: false,
      })
      .onClose.subscribe((result) => {
        if (result === "success") {
          this.loadData();
        }
      });
  }

  /** Hapus satuan */
  delete(id: number): void {
    if (confirm("Yakin ingin menghapus satuan ini?")) {
      this.satuanService.delete(id).subscribe(() => this.loadData());
    }
  }
}
