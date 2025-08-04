import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DeliveryOrderService {
  private baseUrl = "/api/delivery-orders";

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    const headers: any = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return {
      headers: new HttpHeaders(headers),
    };
  }

  // Ambil semua DO
  getDeliveryOrders(): Observable<any> {
    return this.http.get(this.baseUrl, this.getAuthHeaders());
  }

  // Ambil SO yang sudah approved tapi belum ada DO
  getSalesOrdersForDO(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-orders`, this.getAuthHeaders());
  }

  // Buat DO dari SO
  createDO(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data, this.getAuthHeaders());
  }

  // Ambil detail DO
  getDetailDO(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  // Approve DO
  approveDO(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${id}/approve`,
      {},
      this.getAuthHeaders()
    );
  }

  // Cancel DO
  cancelDO(id: number) {
    return this.http.post(`/api/delivery-orders/${id}/cancel`, {}); // pakai POST
  }

  // delivery-order.service.ts
  shipDO(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${id}/ship`,
      {},
      this.getAuthHeaders()
    );
  }
}
