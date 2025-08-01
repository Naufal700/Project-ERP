import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalesQuotationService {
  private apiUrl = "http://localhost:8000/api/sales/quotation";
  private pelangganUrl = "http://localhost:8000/api/pelanggan";
  private produkUrl = "http://localhost:8000/api/produk";

  constructor(private http: HttpClient) {}

  // Method untuk ambil header authorization
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("access_token"); // Ganti token jadi access_token
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Ambil semua penawaran
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // Ambil detail penawaran by ID
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Tambah penawaran baru
  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Update penawaran
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // Hapus penawaran
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Approve penawaran
  approve(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/approve`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Reject penawaran
  reject(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/reject`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Ambil daftar pelanggan untuk dropdown
  getPelanggan(): Observable<any[]> {
    return this.http.get<any[]>(this.pelangganUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  // Ambil daftar produk untuk dropdown
  getProduk(): Observable<any[]> {
    return this.http.get<any[]>(this.produkUrl, {
      headers: this.getAuthHeaders(),
    });
  }
}
