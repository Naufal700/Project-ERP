import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { GudangFormComponent } from "./gudang-form.component";
import { GudangService } from "./gudang.service";

@Component({
  selector: "app-gudang",
  templateUrl: "./gudang.component.html",
  styleUrls: ["./gudang.component.scss"],
})
export class GudangComponent implements OnInit {
  gudangList: any[] = [];
  searchTerm: string = "";
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  sortDirection: "asc" | "desc" = "asc";

  @ViewChild("fileInput") fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private gudangService: GudangService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get filteredGudangList() {
    const filtered = this.gudangList.filter((g) =>
      Object.values(g).some((val) =>
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
  }

  changePage(page: number, event: Event) {
    event.preventDefault();
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  loadData() {
    this.gudangService.getAll().subscribe((res) => {
      this.gudangList = res.sort((a: any, b: any) => {
        const compare = a.kode_gudang.localeCompare(b.kode_gudang);
        return this.sortDirection === "asc" ? compare : -compare;
      });
    });
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    this.loadData();
  }

  triggerFileInput(): void {
    this.fileInputRef?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.gudangService.import(formData).subscribe({
      next: () => {
        this.toastr.success("✅ Berhasil import!");
        this.loadData();
      },
      error: (err) => {
        console.error("❌ Gagal import:", err);
        this.toastr.danger("Gagal import file");
      },
    });
  }

  downloadTemplate(): void {
    this.gudangService.downloadTemplate().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_gudang.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  tambahGudang() {
    this.dialogService
      .open(GudangFormComponent, {
        context: { title: "Tambah Gudang" },
      })
      .onClose.subscribe(() => this.loadData());
  }

  editGudang(data: any) {
    this.dialogService
      .open(GudangFormComponent, {
        context: { title: "Edit Gudang", gudang: data },
      })
      .onClose.subscribe(() => this.loadData());
  }

  hapusGudang(data: any) {
    if (confirm("Apakah Anda yakin ingin menghapus gudang ini?")) {
      this.gudangService.delete(data.id).subscribe({
        next: () => {
          this.toastr.success("Gudang berhasil dihapus");
          this.loadData();
        },
        error: (err) => console.error("Gagal hapus:", err),
      });
    }
  }
}
