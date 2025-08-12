import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface SalesInvoice {
  id: number;
  nomor_invoice: string;
  tanggal: string;
  total: number;
  status: string;
  jenis_pembayaran: string;
  nama_pelanggan?: string; // tambahkan properti ini
}

export interface SalesTunai {
  id: number;
  sales_invoice_id: number;
  tanggal_bayar: string;
  jumlah_bayar: number;
  metode_bayar: string;
  bank_id?: number;
  cara_bayar_id?: number;
  keterangan?: string;
}

@Injectable({
  providedIn: "root",
})
export class SalesTunaiService {
  private baseUrl = "/api"; // sesuaikan baseUrl

  constructor(private http: HttpClient) {}

  getSalesInvoiceTunai(): Observable<SalesInvoice[]> {
    // misal backend support multiple status sebagai query param seperti ini
    return this.http.get<SalesInvoice[]>(
      `${this.baseUrl}/invoice?jenis_pembayaran=tunai&status=approved,lunas`
    );
  }

  getPembayaranTunaiByInvoice(id_invoice: number): Observable<SalesTunai[]> {
    return this.http.get<SalesTunai[]>(
      `${this.baseUrl}/sales-tunai?invoice_id=${id_invoice}`
    );
  }

  bayarTunai(data: any) {
    return this.http.post(`${this.baseUrl}/sales-tunai`, data);
  }

  cancelBayar(id: number) {
    return this.http.delete(`${this.baseUrl}/sales-tunai/${id}`);
  }

  // Bisa tambah method cetak struk sesuai API / kebutuhan
}
