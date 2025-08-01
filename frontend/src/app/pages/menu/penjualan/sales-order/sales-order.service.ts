import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesOrderService {
  private baseUrl = "/api";

  constructor(private http: HttpClient) {}

  getDraftQuotations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/quotations/draft`);
  }

  approveQuotation(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales/quotations/${id}/approve`, {});
  }

  rejectQuotation(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales/quotations/${id}/reject`, {});
  }

  getOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/orders`);
  }

  getOrderDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/orders/${id}`);
  }
  cancelOrder(id: number) {
    return this.http.post<any>(`/api/sales/order/${id}/cancel`, {});
  }
}
