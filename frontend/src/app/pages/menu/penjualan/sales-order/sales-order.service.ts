import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesOrderService {
  private baseUrl = "/api/sales";

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

  /** Cancel Sales Order → kembalikan SQ ke draft */
  cancelOrder(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/${id}/cancel`, {}); // gunakan singular "order"
  }

  /** Cetak PDF per Sales Order */
  printOrder(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/order/${id}/print`, {
      responseType: "blob",
    });
  }

  /** Bulk verifikasi beberapa Sales Order dengan data PPN & Diskon */
  bulkVerify(payload: { ids: number[]; products: any[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/order/bulk-verify`, payload);
  }
}
