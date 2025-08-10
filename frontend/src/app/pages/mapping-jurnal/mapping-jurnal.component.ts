import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { MappingJurnalService } from "./mapping-jurnal.service";
import { MappingJurnalFormComponent } from "./mapping-jurnal-form.component";
import { MODULE_MAPPING } from "./module-mapping";

@Component({
  selector: "app-mapping-jurnal",
  templateUrl: "./mapping-jurnal.component.html",
  styleUrls: ["./mapping-jurnal.component.scss"],
})
export class MappingJurnalComponent implements OnInit {
  mappingList: any[] = [];
  filteredMappingList: any[] = [];
  paginatedMappingList: any[] = [];
  moduleList = MODULE_MAPPING;

  searchTerm: string = "";
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  isRefreshing: boolean = false;

  constructor(
    private mappingService: MappingJurnalService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadMapping();
  }

  loadMapping() {
    this.isRefreshing = true;
    this.mappingService.getAll().subscribe((res) => {
      this.mappingList = res;
      this.applyFilter();
      this.isRefreshing = false;
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();

    this.filteredMappingList = this.mappingList.filter((m) => {
      return (
        (m.modul && m.modul.toLowerCase().includes(term)) ||
        (m.kode_transaksi && m.kode_transaksi.toLowerCase().includes(term)) ||
        (m.nama_transaksi && m.nama_transaksi.toLowerCase().includes(term)) ||
        (m.akun_debit &&
          `${m.akun_debit.kode_akun} - ${m.akun_debit.nama_akun}`
            .toLowerCase()
            .includes(term)) ||
        (m.akun_kredit &&
          `${m.akun_kredit.kode_akun} - ${m.akun_kredit.nama_akun}`
            .toLowerCase()
            .includes(term)) ||
        (m.cara_bayar &&
          m.cara_bayar.nama_cara_bayar.toLowerCase().includes(term)) ||
        (m.bank && m.bank.nama_bank.toLowerCase().includes(term))
      );
    });

    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(
      this.filteredMappingList.length / this.itemsPerPage
    );
    this.changePage(1);
  }

  changeItemsPerPage(size: number) {
    this.itemsPerPage = size;
    this.calculatePagination();
  }

  changePage(page: number, event?: Event) {
    if (event) event.preventDefault();
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMappingList = this.filteredMappingList.slice(start, end);
  }

  getModuleLabel(modul: string): string {
    const found = this.moduleList.find((m) => m.value === modul);
    return found ? found.label : modul;
  }

  openForm(data?: any) {
    this.dialogService
      .open(MappingJurnalFormComponent, { context: { data } })
      .onClose.subscribe((result) => {
        if (result) this.loadMapping();
      });
  }

  deleteMapping(id: number) {
    if (confirm("Yakin ingin menghapus mapping ini?")) {
      this.mappingService.delete(id).subscribe(() => {
        this.toastrService.success("Mapping berhasil dihapus", "Sukses");
        this.loadMapping();
      });
    }
  }

  refreshData() {
    this.loadMapping();
  }
}
