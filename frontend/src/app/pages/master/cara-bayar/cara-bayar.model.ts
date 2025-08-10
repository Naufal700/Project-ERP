export interface CaraBayar {
  id: number;
  nama_cara_bayar: string;
  tipe: "kas" | "bank";
  kode_akun: string;
  is_default: boolean;
}
