import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesOrderService {
  private baseUrl = "/api/sales"; // prefix utama untuk endpoint sales

  constructor(private http: HttpClient) {}

  /** Ambil semua SQ draft untuk approval SO */
  getDraftQuotations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/quotations/draft`);
  }

  /** Approve SQ jadi SO */
  approveQuotation(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/quotations/${id}/approve`, {});
  }

  /** Reject SQ */
  rejectQuotation(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/quotations/${id}/reject`, {});
  }

  /** Ambil semua Sales Order (draft & approved) */
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }

  /** Ambil Sales Order berdasarkan ID (untuk edit) */
  getOrderById(id: number): Observable<any> {
    return this.http.get(`/api/sales-order/${id}`);
  }

  /** Cancel Sales Order → kembalikan SQ ke draft */
  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/${id}/cancel`, {}); // sesuai route Laravel
  }

  /** Cetak PDF per Sales Order */
  printOrder(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/orders/${id}/print`, {
      responseType: "blob",
    });
  }

  /** Bulk verifikasi beberapa Sales Order dengan data PPN & Diskon */
  bulkVerify(payload: { ids: number[]; products: any[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/bulk-verify`, payload);
  }

  /** Buat Sales Order manual (tanpa SQ) */
  createManualOrder(payload: any): Observable<any> {
    return this.http.post(`/api/sales-order`, payload); // sesuai route Laravel
  }

  /** Update Sales Order manual */
  updateManualOrder(id: number, payload: any): Observable<any> {
    return this.http.put(`/api/sales-order/${id}`, payload); // sesuai route Laravel
  }

  /** Ambil master pelanggan (untuk dropdown) */
  getPelanggan(): Observable<any> {
    return this.http.get("/api/pelanggan");
  }

  /** Ambil master produk (untuk dropdown) */
  getProduk(): Observable<any> {
    return this.http.get("/api/produk");
  }
  // sales-order.service.ts
  getSalesOrders(source: "sq" | "manual"): Observable<any> {
    return this.http.get(`/api/sales-order?source=${source}`);
  }
}
