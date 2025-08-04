import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";

@Component({
  selector: "app-jurnal-detail-dialog",
  templateUrl: "./jurnal-detail-dialog.component.html",
  styleUrls: ["./jurnal-detail-dialog.component.scss"],
})
export class JurnalDetailDialogComponent implements OnInit {
  @Input() jurnal: any;
  filteredDetails: any[] = [];
  paginatedDetails: any[] = [];
  searchTerm: string = "";

  // Pagination
  currentPage: number = 1;
  perPage: number = 5;
  totalPages: number = 1;

  constructor(private dialogRef: NbDialogRef<JurnalDetailDialogComponent>) {}

  ngOnInit(): void {
    this.filteredDetails = (this.jurnal.details || []).map((d: any) => ({
      ...d,
      keterangan: d.keterangan || "Manual Jurnal",
      nama_akun: d.coa?.nama_akun || d.nama_akun || "-",
    }));

    this.updatePagination();
  }

  close() {
    this.dialogRef.close();
  }

  filterDetails() {
    const term = this.searchTerm.toLowerCase();
    this.filteredDetails = (this.jurnal.details || [])
      .map((d: any) => ({
        ...d,
        keterangan: d.keterangan || "Manual Jurnal",
        nama_akun: d.coa?.nama_akun || d.nama_akun || "-",
      }))
      .filter(
        (d: any) =>
          d.keterangan?.toLowerCase().includes(term) ||
          d.nama_akun?.toLowerCase().includes(term) ||
          d.kode_akun?.toLowerCase().includes(term)
      );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages =
      Math.ceil(this.filteredDetails.length / this.perPage) || 1;
    const start = (this.currentPage - 1) * this.perPage;
    const end = start + this.perPage;
    this.paginatedDetails = this.filteredDetails.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getTotal(type: "debit" | "kredit"): number {
    return this.filteredDetails
      .filter((d) => d.jenis === type)
      .reduce((sum, d) => sum + (parseFloat(d.nominal) || 0), 0);
  }

  exportExcel() {
    const header = [
      "No",
      "Kode Akun",
      "Nama Akun",
      "Keterangan",
      "Debit",
      "Kredit",
    ];
    const rows = this.filteredDetails.map((d, i) => [
      i + 1,
      d.kode_akun,
      d.nama_akun,
      d.keterangan || "Manual Jurnal",
      d.jenis === "debit" ? d.nominal : 0,
      d.jenis === "kredit" ? d.nominal : 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `detail-jurnal-${this.jurnal.kode_jurnal}.csv`;
    link.click();
  }
}
