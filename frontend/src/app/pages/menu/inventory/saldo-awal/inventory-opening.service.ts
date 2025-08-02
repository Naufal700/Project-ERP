import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InventoryOpeningService {
  private baseUrl = "http://localhost:8000/api";

  constructor(private http: HttpClient) {}

  // Ambil saldo awal persediaan
  getOpeningBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/opening`);
  }

  // Simpan saldo awal per produk-gudang
  saveOpeningBalance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/opening`, data);
  }

  // Ambil daftar produk
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`);
  }

  // Ambil daftar gudang
  getWarehouses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/warehouses`);
  }

  // Import saldo awal
  importOpening(file: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/opening/import`, file);
  }

  // Export saldo awal
  exportOpening(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/inventory/opening/export`, {
      responseType: "blob",
    });
  }
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/opening/template`, {
      responseType: "blob",
    });
  }
}
