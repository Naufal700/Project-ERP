import { Component, OnInit, Input } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import {
  JurnalUmumService,
  JurnalHeader,
  JurnalDetail,
} from "./jurnal-umum.service";
import { CoaService } from "../../../master/coa/coa.service";
import { Coa } from "../../../master/coa/coa.model";

interface JurnalPayloadDetail {
  kode_akun: string;
  jenis: "debit" | "kredit";
  nominal: number;
}

@Component({
  selector: "app-jurnal-form-dialog",
  templateUrl: "./jurnal-form-dialog.component.html",
  styleUrls: ["./jurnal-form-dialog.component.scss"],
})
export class JurnalFormDialogComponent implements OnInit {
  @Input() jurnal?: JurnalHeader; // untuk edit jurnal

  tanggal: string = new Date().toISOString().split("T")[0];
  keterangan: string = "";
  entries: JurnalDetail[] = [];
  coas: Coa[] = [];

  selectedKodeAkun: string = "";
  selectedNamaAkun: string = "";
  inputDebit: number = 0;
  inputKredit: number = 0;
  editingIndex: number | null = null;

  loading = false;

  constructor(
    protected ref: NbDialogRef<JurnalFormDialogComponent>,
    private service: JurnalUmumService,
    private toastr: NbToastrService,
    private coaService: CoaService
  ) {}

  ngOnInit() {
    this.coaService.getAll().subscribe((res) => (this.coas = res));

    // Prefill jika mode edit
    if (this.jurnal) {
      this.tanggal = this.jurnal.tanggal;
      this.keterangan = this.jurnal.keterangan || "";
      this.entries =
        (this.jurnal.details as any[])?.map((d) => ({
          kode_akun: d.kode_akun,
          nama_akun: d.nama_akun || d.coa?.nama_akun || "",
          debit: d.jenis === "debit" ? parseFloat(d.nominal) : 0,
          kredit: d.jenis === "kredit" ? parseFloat(d.nominal) : 0,
        })) || [];
    }
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  onKodeAkunChange(kode: string) {
    this.selectedKodeAkun = kode;
    const found = this.coas.find((c) => c.kode_akun === kode);
    this.selectedNamaAkun = found ? found.nama_akun : "";
  }

  onNamaAkunChange(nama: string) {
    this.selectedNamaAkun = nama;
    const found = this.coas.find((c) => c.nama_akun === nama);
    this.selectedKodeAkun = found ? found.kode_akun : "";
  }

  onInputDebit() {
    if (this.inputDebit > 0) this.inputKredit = 0;
  }

  onInputKredit() {
    if (this.inputKredit > 0) this.inputDebit = 0;
  }

  canAddEntry(): boolean {
    return (
      this.selectedKodeAkun !== "" &&
      this.selectedNamaAkun !== "" &&
      (this.inputDebit > 0 || this.inputKredit > 0)
    );
  }

  addEntry() {
    if (!this.canAddEntry()) {
      this.toastr.warning("Lengkapi input sebelum menambah baris.", "Validasi");
      return;
    }

    const newEntry: JurnalDetail = {
      kode_akun: this.selectedKodeAkun,
      nama_akun: this.selectedNamaAkun,
      debit: this.inputDebit,
      kredit: this.inputKredit,
    };

    if (this.editingIndex !== null) {
      this.entries[this.editingIndex] = newEntry;
      this.editingIndex = null;
    } else {
      this.entries.push(newEntry);
    }

    this.resetInput();
  }

  editEntry(index: number) {
    const entry = this.entries[index];
    this.selectedKodeAkun = entry.kode_akun;
    this.selectedNamaAkun = entry.nama_akun || "";
    this.inputDebit = entry.debit;
    this.inputKredit = entry.kredit;
    this.editingIndex = index;
  }

  removeEntry(index: number) {
    if (this.entries.length === 1) {
      this.toastr.warning("Minimal harus ada satu baris.", "Peringatan");
      return;
    }
    this.entries.splice(index, 1);
    if (this.editingIndex === index) this.cancelEdit();
  }

  cancelEdit() {
    this.resetInput();
    this.editingIndex = null;
  }

  resetInput() {
    this.selectedKodeAkun = "";
    this.selectedNamaAkun = "";
    this.inputDebit = 0;
    this.inputKredit = 0;
  }

  get totalDebit() {
    return this.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  }

  get totalKredit() {
    return this.entries.reduce((sum, e) => sum + (e.kredit || 0), 0);
  }

  save() {
    if (this.totalDebit !== this.totalKredit) {
      this.toastr.warning("Jurnal belum balance!", "Validasi");
      return;
    }

    for (const e of this.entries) {
      if (!e.kode_akun || (e.debit <= 0 && e.kredit <= 0)) {
        this.toastr.warning(
          "Setiap baris harus memiliki kode akun dan nominal debit/kredit.",
          "Validasi"
        );
        return;
      }
      if (e.debit > 0 && e.kredit > 0) {
        this.toastr.warning(
          "Satu baris tidak boleh memiliki nilai debit dan kredit sekaligus.",
          "Validasi"
        );
        return;
      }
    }

    const details: JurnalPayloadDetail[] = this.entries.map((e) => ({
      kode_akun: e.kode_akun,
      jenis: e.debit > 0 ? "debit" : "kredit",
      nominal: e.debit > 0 ? e.debit : e.kredit,
    }));

    const payload: JurnalHeader = {
      tanggal: this.tanggal,
      keterangan: this.keterangan,
      details,
    };

    this.loading = true;

    if (this.jurnal?.id) {
      this.service.update(this.jurnal.id, payload).subscribe({
        next: () => {
          this.toastr.success("Jurnal berhasil diperbarui", "Sukses");
          this.ref.close("success");
        },
        error: () => {
          this.toastr.danger("Gagal memperbarui jurnal", "Error");
          this.loading = false;
        },
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.toastr.success("Jurnal berhasil disimpan", "Sukses");
          this.ref.close("success");
        },
        error: () => {
          this.toastr.danger("Gagal menyimpan jurnal", "Error");
          this.loading = false;
        },
      });
    }
  }

  cancel() {
    this.ref.close();
  }
}
