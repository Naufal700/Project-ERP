import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { CaraBayarService } from "./cara-bayar.service";
import { CaraBayarFormDialogComponent } from "./cara-bayar-form-dialog.component";

@Component({
  selector: "app-cara-bayar",
  templateUrl: "./cara-bayar.component.html",
  styleUrls: ["./cara-bayar.component.scss"],
})
export class CaraBayarComponent implements OnInit {
  caraBayarList: any[] = [];
  searchTerm: string = "";
  isRefreshing = false;

  constructor(
    private caraBayarService: CaraBayarService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadCaraBayar();
  }

  loadCaraBayar() {
    this.isRefreshing = true;
    this.caraBayarService.getCaraBayar().subscribe({
      next: (res) => {
        this.caraBayarList = res;
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data cara bayar", "Error");
      },
    });
  }

  openFormDialog(caraBayar?: any) {
    this.dialogService
      .open(CaraBayarFormDialogComponent, { context: { caraBayar } })
      .onClose.subscribe((result) => {
        if (result) this.loadCaraBayar();
      });
  }

  deleteCaraBayar(id: number) {
    if (confirm("Yakin ingin menghapus cara bayar ini?")) {
      this.caraBayarService.deleteCaraBayar(id).subscribe({
        next: () => {
          this.toastr.success("Cara bayar berhasil dihapus", "Sukses");
          this.loadCaraBayar();
        },
        error: () => this.toastr.danger("Gagal menghapus cara bayar", "Error"),
      });
    }
  }

  getFilteredCaraBayar() {
    return this.caraBayarList.filter(
      (cb) =>
        !this.searchTerm ||
        cb.kode_cara_bayar
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        cb.nama_cara_bayar.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
