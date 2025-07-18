import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { HttpClient } from "@angular/common/http";
import { KaryawanFormComponent } from "./karyawan-form.component";

@Component({
  selector: "app-karyawan",
  templateUrl: "./karyawan.component.html",
  styleUrls: ["./karyawan.component.scss"],
})
export class KaryawanComponent implements OnInit {
  data: any[] = [];
  filteredData: any[] = [];
  searchTerm = "";
  loading = false;
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
    this.http.get<any>("/api/karyawan").subscribe({
      next: (res) => {
        this.data = res.data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.toastr.danger("Gagal mengambil data karyawan");
        this.loading = false;
      },
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.data.filter(
      (d) =>
        d.nama_lengkap?.toLowerCase().includes(term) ||
        d.nip?.toLowerCase().includes(term)
    );
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredData = filtered.slice(start, end);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  openForm(data: any = null) {
    this.dialogService
      .open(KaryawanFormComponent, { context: { data } })
      .onClose.subscribe((result) => {
        if (result === true) {
          this.loadData();
          const message = data
            ? "Data Karyawan Berhasil diupdate"
            : "Data Karyawan Berhasil ditambahkan";
          this.toastr.success(message);
        }
      });
  }

  delete(id: number) {
    if (confirm("Yakin hapus?")) {
      this.http.delete(`/api/karyawan/${id}`).subscribe(() => {
        this.toastr.success("Berhasil dihapus");
        this.loadData();
      });
    }
  }

  downloadTemplate() {
    window.open("/api/karyawan/template", "_blank");
  }
  triggerFileInput() {
    const input = document.querySelector<HTMLInputElement>("#fileInput");
    if (input) input.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    this.http.post("/api/karyawan/import", formData).subscribe({
      next: () => {
        this.toastr.success("Import berhasil");
        this.loadData();
      },
      error: () => this.toastr.danger("Gagal import"),
    });
  }
}
