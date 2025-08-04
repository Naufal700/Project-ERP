import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesInvoiceService {
  private baseUrl = "/api/invoice";

  constructor(private http: HttpClient) {}

  /**
   * Ambil semua faktur penjualan
   */
  getInvoices(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  /**
   * Ambil semua DO yang siap untuk dibuat faktur
   */

  getAvailableDO(): Observable<any> {
    return this.http.get(`${this.baseUrl}/do`);
  }

  /**
   * Buat faktur baru dari DO
   */
  createInvoice(data: { id_do: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  /**
   * Approve faktur (ubah status ke approved dan buat jurnal)
   */
  approveInvoice(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve`, {});
  }

  /**
   * Rollback faktur (kembali ke draft, hapus jurnal)
   */
  rollbackInvoice(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/rollback`, {});
  }

  /**
   * Batalkan faktur (hapus invoice, detail, dan jurnal)
   */
  cancelInvoice(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/cancel`);
  }
}
