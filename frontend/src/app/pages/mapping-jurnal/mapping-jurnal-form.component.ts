import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef, NbToastrService } from "@nebular/theme";
import { MappingJurnalService } from "./mapping-jurnal.service";
import { MODULE_MAPPING } from "./module-mapping";

@Component({
  selector: "app-mapping-jurnal-form",
  templateUrl: "./mapping-jurnal-form.component.html",
  styleUrls: ["./mapping-jurnal-form.component.scss"],
})
export class MappingJurnalFormComponent implements OnInit {
  @Input() data: any;

  formData: any = {
    modul: "",
    kode_transaksi: "",
    nama_transaksi: "",
    kode_akun_debit: "",
    kode_akun_kredit: "",
    keterangan: "",
  };

  moduleList = MODULE_MAPPING;
  coaList: any[] = [];

  // Mapping kode & nama transaksi berdasarkan modul
  transactionMap: any = {
    "sales/quotation": { code: "SQ", name: "Penawaran Penjualan" },
    "sales/order": { code: "SO", name: "Pesanan Penjualan" },
    "sales/delivery": { code: "SD", name: "Pengiriman Penjualan" },
    "sales/invoice": { code: "SI", name: "Faktur Penjualan" },
    "sales/payment": { code: "SP", name: "Pembayaran Penjualan" },
    "sales/return": { code: "SR", name: "Retur Penjualan" },

    "purchase/pr": { code: "PR", name: "Permintaan Pembelian" },
    "purchase/po": { code: "PO", name: "Purchase Order" },
    "purchase/receive": { code: "GR", name: "Penerimaan Barang" },
    "purchase/invoice": { code: "PI", name: "Faktur Pembelian" },
    "purchase/payment": { code: "PP", name: "Pembayaran Pembelian" },
    "purchase/return": { code: "PRT", name: "Retur Pembelian" },

    "cash/in": { code: "CI", name: "Kas Masuk" },
    "cash/out": { code: "CO", name: "Kas Keluar" },
    "cash/transfer": { code: "CT", name: "Mutasi Kas" },

    "inventory/adjustment": { code: "IA", name: "Penyesuaian Stok" },
    "inventory/mutation": { code: "IM", name: "Mutasi Gudang" },

    "accounting/journal": { code: "JU", name: "Jurnal Umum" },
    "accounting/adjustment": { code: "JA", name: "Jurnal Penyesuaian" },

    "hr/salary": { code: "PY", name: "Pembayaran Gaji" },
    "asset/depreciation": { code: "AD", name: "Penyusutan Aset" },
  };

  constructor(
    private dialogRef: NbDialogRef<MappingJurnalFormComponent>,
    private mappingService: MappingJurnalService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      // Mode edit: isi data lama
      this.formData = { ...this.data };

      if (this.data.akun_debit) {
        this.formData.kode_akun_debit = this.data.akun_debit.kode_akun;
      }
      if (this.data.akun_kredit) {
        this.formData.kode_akun_kredit = this.data.akun_kredit.kode_akun;
      }
    }

    // Load daftar akun COA
    this.mappingService.getCOA().subscribe((res) => (this.coaList = res));
  }

  /**
   * Auto generate kode transaksi & nama transaksi saat modul dipilih
   */
  onModuleChange(selectedModule: string) {
    this.formData.modul = selectedModule;

    // Hanya auto-set jika tambah data baru
    if (!this.data) {
      const mapping = this.transactionMap[selectedModule];
      if (mapping) {
        this.formData.kode_transaksi = mapping.code;
        this.formData.nama_transaksi = mapping.name;
      } else {
        this.formData.kode_transaksi = "";
        this.formData.nama_transaksi = "";
      }
    }
  }

  save() {
    const payload = {
      modul: this.formData.modul,
      kode_transaksi: this.formData.kode_transaksi,
      nama_transaksi: this.formData.nama_transaksi,
      kode_akun_debit: this.formData.kode_akun_debit,
      kode_akun_kredit: this.formData.kode_akun_kredit,
      keterangan: this.formData.keterangan,
    };

    if (this.data) {
      this.mappingService.update(this.data.id, payload).subscribe(() => {
        this.toastrService.success("Mapping berhasil diupdate", "Sukses");
        this.dialogRef.close(true);
      });
    } else {
      this.mappingService.create(payload).subscribe(() => {
        this.toastrService.success("Mapping berhasil ditambahkan", "Sukses");
        this.dialogRef.close(true);
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
