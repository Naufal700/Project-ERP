import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class GudangService {
  private baseUrl = "/api/gudang";

  constructor(private http: HttpClient) {}

  /** Ambil semua data gudang */
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  /** Simpan gudang baru */
  store(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  /** Update gudang berdasarkan ID */
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  /** Hapus gudang */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Download template excel */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-template`, {
      responseType: "blob",
    });
  }

  /** Import data gudang dari file excel */
  import(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, formData);
  }

  /** Ambil kode gudang otomatis */
  getKodeOtomatis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/kode-otomatis`);
  }
}
