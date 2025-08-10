import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { BankService } from "./bank.service";

@Component({
  selector: "app-bank-form-dialog",
  templateUrl: "./bank-form-dialog.component.html",
  styleUrls: ["./bank-form-dialog.component.scss"],
})
export class BankFormDialogComponent implements OnInit {
  @Input() bank: any;
  form: FormGroup;
  akunList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<BankFormDialogComponent>,
    private bankService: BankService,
    private toastrService: NbToastrService
  ) {
    this.form = this.fb.group({
      nama_bank: ["", Validators.required],
      no_rekening: [""],
      nama_pemilik: [""],
      kode_akun: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCOA();
    if (this.bank) {
      this.form.patchValue(this.bank);
    }
  }

  loadCOA(): void {
    this.bankService.getAkunKasBank().subscribe({
      next: (data) => (this.akunList = data),
      error: () => this.toastrService.danger("Gagal mengambil data akun"),
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const data = this.form.value;

    const request = this.bank
      ? this.bankService.update(this.bank.id, data)
      : this.bankService.create(data);

    request.subscribe({
      next: () => {
        this.toastrService.success("Data berhasil disimpan");
        this.dialogRef.close("saved");
      },
      error: () => this.toastrService.danger("Gagal menyimpan data"),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
