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
    this.filteredMappingList = this.mappingList.filter((m) =>
      Object.values(m).some((val) =>
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
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
