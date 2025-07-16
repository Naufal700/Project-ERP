import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProdukService {
  private baseUrl = "http://localhost:8000/api/produk";

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  store(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/template`, { responseType: "blob" });
  }

  import(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, formData);
  }

  generateKode(): Observable<{ kode: string }> {
    return this.http.get<{ kode: string }>(`${this.baseUrl}/generate-kode`);
  }
}
