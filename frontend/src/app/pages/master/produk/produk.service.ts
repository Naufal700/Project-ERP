import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProdukService {
  private baseUrl = "http://localhost:8000/api/produk";

  constructor(private http: HttpClient) {}

  // Ambil semua produk
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Simpan produk baru
  store(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // Update produk
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // Hapus produk
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // 📤 Export Produk ke Excel
  exportExcel(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export-excel`, {
      responseType: "blob",
    });
  }

  // 📥 Download Template Produk
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/template-excel`, {
      responseType: "blob",
    });
  }

  // 📥 Import Produk dari Excel
  importExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import-excel`, formData);
  }

  // Generate kode produk otomatis
  generateKode(): Observable<{ kode: string }> {
    return this.http.get<{ kode: string }>(`${this.baseUrl}/generate-kode`);
  }
}
