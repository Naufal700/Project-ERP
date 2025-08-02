import { Component, OnInit } from "@angular/core";
import { NbToastrService } from "@nebular/theme";
import { InventorySettingsService } from "./inventory-setting.service";

@Component({
  selector: "app-inventory-settings",
  templateUrl: "./inventory-setting.component.html",
  styleUrls: ["./inventory-setting.component.scss"],
})
export class InventorySettingsComponent implements OnInit {
  metode: string = "fifo";
  loading = false;

  constructor(
    private inventoryService: InventorySettingsService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.inventoryService.getSettings().subscribe((res) => {
      this.metode = res?.metode || "fifo";
    });
  }

  saveSettings() {
    this.loading = true;
    this.inventoryService.updateSettings({ metode: this.metode }).subscribe({
      next: () => {
        this.toastr.success("Metode persediaan berhasil diperbarui", "Sukses");
        this.loading = false;
      },
      error: () => {
        this.toastr.danger("Gagal memperbarui metode persediaan", "Error");
        this.loading = false;
      },
    });
  }
}
