import { Component, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { InventoryOpeningService } from "./inventory-opening.service";

@Component({
  selector: "app-inventory-opening-form",
  templateUrl: "./inventory-opening-form.component.html",
  styleUrls: ["./inventory-opening-form.component.scss"],
})
export class InventoryOpeningFormComponent implements OnInit {
  products: any[] = [];
  warehouses: any[] = [];
  form = { id_produk: "", id_gudang: "", qty: 0, harga: 0 };
  loading = false;

  constructor(
    private ref: NbDialogRef<InventoryOpeningFormComponent>,
    private openingService: InventoryOpeningService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.openingService.getProducts().subscribe((res) => (this.products = res));
    this.openingService
      .getWarehouses()
      .subscribe((res) => (this.warehouses = res));
  }

  save() {
    this.loading = true;
    this.openingService.saveOpeningBalance(this.form).subscribe({
      next: () => {
        this.toastr.success("Data berhasil disimpan", "Sukses");
        this.ref.close(true);
      },
      error: () => {
        this.loading = false;
        this.toastr.danger("Gagal menyimpan data", "Error");
      },
    });
  }

  cancel() {
    this.ref.close(false);
  }
}
