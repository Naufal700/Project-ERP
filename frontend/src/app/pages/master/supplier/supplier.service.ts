import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SupplierService {
  private baseUrl = "http://localhost:8000/api/suppliers";

  constructor(private http: HttpClient) {}

  /** Ambil semua supplier */
  getAll(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  /** Ambil supplier berdasarkan ID */
  getById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  /** Tambah supplier baru */
  create(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  /** Update supplier */
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  /** Hapus supplier */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Import supplier dari file Excel */
  import(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, formData);
  }

  /** Download template Excel */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/template`, {
      responseType: "blob",
    });
  }
}
