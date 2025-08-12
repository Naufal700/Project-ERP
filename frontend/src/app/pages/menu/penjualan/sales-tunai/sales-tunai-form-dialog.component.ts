import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SalesTunaiService, SalesInvoice } from "./sales-tunai.service";
import {
  MasterDataService,
  Bank,
  CaraBayar,
} from "../../../../@core/services/master-data.service";

@Component({
  selector: "app-sales-tunai-form-dialog",
  templateUrl: "./sales-tunai-form-dialog.component.html",
  styleUrls: ["./sales-tunai-form-dialog.component.scss"],
})
export class SalesTunaiFormDialogComponent implements OnInit {
  @Input() invoice!: SalesInvoice;

  form: FormGroup;
  banks: Bank[] = [];
  caraBayarList: CaraBayar[] = [];
  showJumlahBayar = false; // ✅ Untuk toggle input jumlah bayar

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
      });
    }

    // Load bank dan cara bayar
    this.masterDataService.getBanks().subscribe({
      next: (banks) => (this.banks = banks),
      error: () => this.toastr.danger("Gagal load data bank"),
    });

    this.masterDataService.getCaraBayar().subscribe({
      next: (caraBayarList) => (this.caraBayarList = caraBayarList),
      error: () => this.toastr.danger("Gagal load data cara bayar"),
    });

    // Reset bank_id jika metode bayar bukan transfer
    this.form.get("metode_bayar")?.valueChanges.subscribe((val) => {
      if (val !== "transfer") {
        this.form.patchValue({ bank_id: null });
      }
    });
  }

  get totalTagihan() {
    return this.invoice
      ? this.formatRupiah(this.invoice.total.toString())
      : "0";
  }

  // Klik total tagihan → munculkan input jumlah bayar
  enableJumlahBayar() {
    this.showJumlahBayar = true;

    // Pastikan invoice.total adalah number dan diformat langsung
    const total = Number(this.invoice.total) || 0;
    this.form.patchValue({
      jumlah_bayar: this.formatRupiah(total.toString()),
    });
  }

  onJumlahBayarInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    val = val.replace(/\D/g, "");
    val = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    this.form.get("jumlah_bayar")?.setValue(val, { emitEvent: false });
  }

  submit() {
    if (this.form.invalid) return;

    let val = this.form.get("jumlah_bayar")?.value || "";
    val = val.replace(/\./g, "");

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
    let numberString = value.replace(/\D/g, ""); // hapus selain angka
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
