import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

export interface SalesInvoice {
  id: number;
  nomor_invoice: string;
  nama_pelanggan: string;
  status: string;
  jenis_pembayaran: string;
  total: number;
  id_pelanggan: number; // tambahkan ini
  tanggal: string;
  tanggal_jatuh_tempo: string;
}

export interface SalesPiutang {
  id: number;
  sales_invoice_id: number;
  tanggal_jatuh_tempo: string;
  jumlah_piutang: number;
  jumlah_terbayar: number;
  status: string;
  keterangan: string;
  sales_invoice: SalesInvoice;
}

@Injectable({
  providedIn: "root",
})
export class PiutangService {
  private baseUrl = "/api/sales-piutang";

  constructor(private http: HttpClient) {}

  // Ambil invoice dengan filter approved & piutang
  getInvoices(
    statuses: string[] = ["approved"],
    jenis_pembayaran = "piutang",
    searchTerm = ""
  ): Observable<SalesInvoice[]> {
    let params = new HttpParams();
    statuses.forEach((status) => {
      params = params.append("status[]", status); // Kirim status[] berulang
    });
    params = params.set("jenis_pembayaran", jenis_pembayaran);

    if (searchTerm) {
      params = params.set("search", searchTerm);
    }

    return this.http.get<SalesInvoice[]>(`${this.baseUrl}/invoice`, { params });
  }
  // Ambil piutang yang sudah ada (list piutang)
  getPiutangs(): Observable<SalesPiutang[]> {
    return this.http.get<SalesPiutang[]>(`${this.baseUrl}`);
  }

  // Approve piutang (POST ke sales-piutang)
  approvePiutang(payload: {
    sales_invoice_id: number;
    tanggal_jatuh_tempo: string;
    jumlah_piutang: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/approve`, payload);
  }

  // Approve invoice piutang (ubah status jadi 'collecting')
  approveInvoicePiutang(invoiceId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoice/${invoiceId}/approve`, {});
  }

  // Collecting batch (jika ada endpoint collecting batch)
  collecting(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/collecting`, data);
  }
  cancelPiutang(id: number): Observable<any> {
    // Sesuaikan endpoint cancel di backend (misal DELETE atau POST)
    return this.http.post(`${this.baseUrl}/${id}/cancel`, {});
  }
  verifyInvoices(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-batch`, { ids }); // pastikan ini object dengan key "ids"
  }
}
