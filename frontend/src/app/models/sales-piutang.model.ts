export interface Pelanggan {
  id: number;
  kode_pelanggan: string;
  nama_pelanggan: string;
  email?: string;
  // Add other customer fields as needed
}

export interface SalesInvoice {
  id: number;
  nomor_invoice: string;
  tanggal: string;
  id_pelanggan: number;
  pelanggan?: Pelanggan; // Make it optional with ?
  jenis_pembayaran: string;
  status: string;
  total: number;
  tanggal_jatuh_tempo: string;
  // Add other invoice fields
}

export interface SalesPiutang {
  id: number;
  sales_invoice_id: number;
  sales_invoice?: SalesInvoice; // Make it optional
  tanggal_jatuh_tempo: string;
  jumlah_piutang: number;
  jumlah_terbayar: number;
  status: string;
  keterangan?: string;
}
export interface SalesPiutangCollectingRequest {
  piutang_ids: number[];
  jumlah_bayar: number;
  tanggal_bayar: string;
  keterangan?: string;
  // Add other fields if needed
}
