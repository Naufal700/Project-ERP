import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InventoryReportService {
  private apiUrl = "http://localhost:8000/api/inventory"; // sesuaikan

  constructor(private http: HttpClient) {}

  // Get stock report with optional params
  getStockReport(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/stock-report`, { params: httpParams });
  }

  // Import stock report
  importStockReport(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(`${this.apiUrl}/stock-report/import`, formData);
  }

  // Export stock report with optional params
  exportStockReport(params?: any): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.apiUrl}/stock-report/export`, {
      params: httpParams,
      responseType: "blob",
    });
  }

  // Download template saldo awal
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/stock-report/template`, {
      responseType: "blob",
    });
  }

  // ✅ NEW: Closing persediaan
  closingStock(periode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/closing`, { periode });
  }

  // ✅ NEW: Cek status closing
  checkClosingStatus(periode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/closing/status`, {
      params: { periode },
    });
  }
}
