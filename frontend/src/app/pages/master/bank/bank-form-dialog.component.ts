import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { BankService } from "./bank.service";

@Component({
  selector: "app-bank-form-dialog",
  templateUrl: "./bank-form-dialog.component.html",
  styleUrls: ["./bank-form-dialog.component.scss"],
})
export class BankFormDialogComponent implements OnInit {
  @Input() bank: any;
  formData: any = {
    kode_bank: "",
    nama_bank: "",
    no_rekening: "",
    atas_nama: "",
    cara_bayar_ids: [],
  };
  caraBayarList: any[] = [];

  constructor(
    private dialogRef: NbDialogRef<BankFormDialogComponent>,
    private bankService: BankService,
    private toastr: NbToastrService
  ) {}

  ngOnInit(): void {
    if (this.bank) {
      this.formData = {
        kode_bank: this.bank.kode_bank,
        nama_bank: this.bank.nama_bank,
        no_rekening: this.bank.no_rekening,
        atas_nama: this.bank.atas_nama,
        cara_bayar_ids: this.bank.cara_bayar?.map((cb: any) => cb.id) || [],
      };
    }

    this.bankService.getCaraBayar().subscribe({
      next: (res) => (this.caraBayarList = res),
      error: () => this.toastr.danger("Gagal memuat cara bayar", "Error"),
    });
  }

  save() {
    const request = this.bank
      ? this.bankService.updateBank(this.bank.id, this.formData)
      : this.bankService.createBank(this.formData);

    request.subscribe({
      next: () => {
        this.toastr.success(
          this.bank ? "Bank berhasil diperbarui" : "Bank berhasil ditambahkan",
          "Sukses"
        );
        this.dialogRef.close(true);
      },
      error: () => this.toastr.danger("Gagal menyimpan data bank", "Error"),
    });
  }

  close() {
    this.dialogRef.close();
  }
}
