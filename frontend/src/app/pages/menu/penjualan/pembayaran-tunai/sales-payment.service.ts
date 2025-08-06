import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesPaymentService {
  private baseUrl = "/api/sales-payment";

  constructor(private http: HttpClient) {}

  /** Ambil semua pembayaran */
  getPayments(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  /** Simpan pembayaran tunai */
  createPayment(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }
}
