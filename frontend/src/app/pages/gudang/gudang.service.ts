import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class GudangService {
  private baseUrl = "/api/gudang";

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
  getKodeOtomatis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/kode-otomatis`);
  }
}
