import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { HttpClient } from "@angular/common/http";
import { HargaJualFormComponent } from "./harga-jual-form.component";

@Component({
  selector: "app-harga-jual",
  templateUrl: "./harga-jual.component.html",
  styleUrls: ["./harga-jual.component.scss"],
})
export class HargaJualComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  loading = false;

  searchTerm = "";
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private http: HttpClient,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.http.get<any>("/api/harga-jual").subscribe({
      next: (res) => {
        this.data = res.data.map((item) => ({
          ...item,
          is_aktif: item.aktif == true || item.aktif == "t" || item.aktif == 1,
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toastr.danger("Gagal mengambil data");
        this.loading = false;
      },
    });
  }

  openForm(data: any = null) {
    this.dialogService
      .open(HargaJualFormComponent, {
        context: { data },
      })
      .onClose.subscribe((result) => {
        if (result === "saved") {
          this.toastr.success("Data berhasil disimpan");
          this.loadData(); // Refresh data otomatis
        }
      });
  }

  delete(id: number) {
    if (confirm("Yakin ingin menghapus data ini?")) {
      this.http.delete(`/api/harga-jual/${id}`).subscribe(() => {
        this.toastr.success("Data berhasil dihapus");
        this.loadData();
      });
    }
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.data.filter((d) =>
      d.produk?.nama_produk?.toLowerCase().includes(term)
    );

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredData = filtered.slice(start, end);
  }

  changePage(page: number, event: Event) {
    event.preventDefault();
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.applyFilters();
  }
}
