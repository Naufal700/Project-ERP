import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SalesTunaiService, SalesInvoice } from "./sales-tunai.service";
import {
  MasterDataService,
  Bank,
  CaraBayar,
} from "../../../../@core/services/master-data.service";
import { NbToastrService } from "@nebular/theme";

@Component({
  selector: "app-sales-tunai-form-dialog",
  templateUrl: "./sales-tunai-form-dialog.component.html",
})
export class SalesTunaiFormDialogComponent implements OnInit {
  @Input() invoice!: SalesInvoice;

  form: FormGroup;
  banks: Bank[] = [];
  caraBayarList: CaraBayar[] = [];

  constructor(
    protected ref: NbDialogRef<SalesTunaiFormDialogComponent>,
    private fb: FormBuilder,
    private salesTunaiService: SalesTunaiService,
    private masterDataService: MasterDataService,
    private toastr: NbToastrService
  ) {
    this.form = this.fb.group({
      sales_invoice_id: [null, Validators.required],
      tanggal_bayar: [
        new Date().toISOString().substring(0, 10),
        Validators.required,
      ],
      jumlah_bayar: [null, [Validators.required, Validators.min(0.01)]],
      metode_bayar: ["tunai", Validators.required],
      bank_id: [null],
      cara_bayar_id: [null],
      keterangan: [""],
    });
  }

  ngOnInit(): void {
    if (this.invoice) {
      this.form.patchValue({
        sales_invoice_id: this.invoice.id,
        jumlah_bayar: this.formatRupiah(this.invoice.total.toString()),
      });
    }

    // Load bank dan cara bayar dari API
    this.masterDataService.getBanks().subscribe({
      next: (banks) => (this.banks = banks),
      error: () => this.toastr.danger("Gagal load data bank"),
    });

    this.masterDataService.getCaraBayar().subscribe({
      next: (caraBayarList) => (this.caraBayarList = caraBayarList),
      error: () => this.toastr.danger("Gagal load data cara bayar"),
    });

    // Reset bank_id saat metode bayar bukan transfer
    this.form.get("metode_bayar")?.valueChanges.subscribe((val) => {
      if (val !== "transfer") {
        this.form.patchValue({ bank_id: null });
      }
    });
  }

  // Fungsi untuk format input jumlah_bayar jadi Rupiah (tanpa "Rp", hanya pemisah ribuan dengan titik)
  onJumlahBayarInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    // Hapus semua karakter selain angka
    val = val.replace(/\D/g, "");

    // Format angka dengan titik ribuan
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Set nilai ke form control tanpa emit event agar tidak infinite loop
    this.form.get("jumlah_bayar")?.setValue(val, { emitEvent: false });
  }

  submit() {
    if (this.form.invalid) return;

    // Ambil nilai jumlah_bayar dan bersihkan format
    let val = this.form.get("jumlah_bayar")?.value || "";
    val = val.replace(/\./g, "");

    // Buat salinan data form
    const formData = { ...this.form.value, jumlah_bayar: val };

    this.salesTunaiService.bayarTunai(formData).subscribe({
      next: () => {
        this.toastr.success("Pembayaran berhasil disimpan");
        this.ref.close("success");
      },
      error: (err) => {
        this.toastr.danger(
          "Gagal menyimpan pembayaran: " + (err.error?.message || err.message)
        );
      },
    });
  }

  cancel() {
    this.ref.close();
  }
  private formatRupiah(value: string): string {
    // Hapus semua karakter selain angka
    let numberString = value.replace(/\D/g, "");

    // Format angka dengan titik ribuan
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
