import { Component, OnInit } from "@angular/core";
import { NbDialogService, NbToastrService } from "@nebular/theme";
import { BankService } from "./bank.service";
import { BankFormDialogComponent } from "./bank-form-dialog.component";

@Component({
  selector: "app-bank",
  templateUrl: "./bank.component.html",
  styleUrls: ["./bank.component.scss"],
})
export class BankComponent implements OnInit {
  banks: any[] = [];
  searchTerm: string = "";
  isRefreshing = false;

  constructor(
    private bankService: BankService,
    private dialogService: NbDialogService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks() {
    this.isRefreshing = true;
    this.bankService.getBanks().subscribe({
      next: (res) => {
        this.banks = res;
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
        this.toastr.danger("Gagal memuat data bank", "Error");
      },
    });
  }

  openFormDialog(bank?: any) {
    this.dialogService
      .open(BankFormDialogComponent, { context: { bank } })
      .onClose.subscribe((result) => {
        if (result) this.loadBanks();
      });
  }

  deleteBank(id: number) {
    if (confirm("Yakin ingin menghapus bank ini?")) {
      this.bankService.deleteBank(id).subscribe({
        next: () => {
          this.toastr.success("Bank berhasil dihapus", "Sukses");
          this.loadBanks();
        },
        error: () => this.toastr.danger("Gagal menghapus bank", "Error"),
      });
    }
  }

  getFilteredBanks() {
    return this.banks.filter(
      (b) =>
        !this.searchTerm ||
        b.nama_bank.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        b.kode_bank.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
