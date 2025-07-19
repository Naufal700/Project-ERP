import { Component, OnInit } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { DivisiFormComponent } from "./divisi-form.component";
import { ProyekFormComponent } from "./proyek-form.component";

@Component({
  selector: "app-divisi-proyek",
  templateUrl: "./divisi-proyek.component.html",
  styleUrls: ["./divisi-proyek.component.scss"],
})
export class DivisiProyekComponent implements OnInit {
  selectedTab: string = "divisi";

  divisiData = [
    { kode_divisi: "D01", nama_divisi: "Keuangan" },
    { kode_divisi: "D02", nama_divisi: "Operasional" },
  ];

  proyekData = [
    {
      kode_proyek: "P01",
      nama_proyek: "ERP Rumah Sakit",
      tipe_penanggung_jawab: "Internal",
      id_karyawan: "K001",
      nama_penanggung_jawab_opsional: "",
    },
  ];

  constructor(private dialogService: NbDialogService) {}

  ngOnInit(): void {}

  openFormDivisi(): void {
    this.dialogService.open(DivisiFormComponent);
  }

  openFormProyek(): void {
    this.dialogService.open(ProyekFormComponent);
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }
}
