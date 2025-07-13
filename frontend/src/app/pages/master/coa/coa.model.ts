export interface Coa {
  id?: number;
  kode_akun: string;
  nama_akun: string;
  level_akun: number;
  parent_kode_akun?: string;
  kategori_akun?: string; // ✅ Tambahan field baru (misal: aset lancar, aset tetap, kewajiban)
  tipe_akun: string; // Misal: 'kas', 'bank', 'piutang', 'persediaan'
  kategori_laporan: string; // Misal: 'neraca', 'laba_rugi'
  saldo_normal: string; // 'debit' / 'kredit'
  saldo_awal: number;
  is_header: boolean;
  keterangan?: string;
  created_at?: string;
  updated_at?: string;
}
