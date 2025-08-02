import { Component, OnInit } from "@angular/core";
import { InventoryOpeningService } from "./inventory-opening.service";
import { NbToastrService } from "@nebular/theme";

@Component({
  selector: "app-inventory-opening",
  templateUrl: "./inventory-opening.component.html",
  styleUrls: ["./inventory-opening.component.scss"],
})
export class InventoryOpeningComponent implements OnInit {
  openingList: any[] = [];
  filteredList: any[] = [];
  produkList: any[] = [];
  gudangList: any[] = [];
  filterProduk: string = "";
  filterGudang: string = "";

  constructor(
    private openingService: InventoryOpeningService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadWarehouses();
    this.loadOpening();
  }

  loadProducts() {
    this.openingService.getProducts().subscribe((res) => {
      this.produkList = res;
    });
  }

  loadWarehouses() {
    this.openingService.getWarehouses().subscribe((res) => {
      this.gudangList = res;
    });
  }

  loadOpening() {
    this.openingService.getOpeningBalance().subscribe((res) => {
      this.openingList = res.map((item: any) => ({
        ...item,
        qty: item.qty || 0,
        harga: item.harga || item.harga_jual || 0, // ambil harga jual default
        total: (item.qty || 0) * (item.harga || item.harga_jual || 0),
      }));
      this.filteredList = [...this.openingList];
    });
  }

  filterData() {
    this.filteredList = this.openingList.filter((item) => {
      const matchProduk = this.filterProduk
        ? item.id_produk == this.filterProduk
        : true;
      const matchGudang = this.filterGudang
        ? item.id_gudang == this.filterGudang
        : true;
      return matchProduk && matchGudang;
    });
  }

  updateTotal(item: any) {
    item.total = (item.qty || 0) * (item.harga || 0);
  }

  saveItem(item: any) {
    const data = {
      id_produk: item.id_produk,
      id_gudang: item.id_gudang,
      qty: item.qty,
      harga: item.harga,
    };

    this.openingService.saveOpeningBalance(data).subscribe(() => {
      this.toastr.success("Data berhasil disimpan", "Sukses");
    });
  }

  exportExcel() {
    this.openingService.exportOpening().subscribe((res: any) => {
      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "saldo_awal_persediaan.xlsx";
      link.click();
    });
  }

  downloadTemplate() {
    this.openingService.downloadTemplate().subscribe((res: any) => {
      const blob = new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "template_saldo_awal.xlsx";
      link.click();
    });
  }

  importExcel(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    this.openingService.importOpening(formData).subscribe(() => {
      this.toastr.success("Import berhasil", "Sukses");
      this.loadOpening();
    });
  }
}
