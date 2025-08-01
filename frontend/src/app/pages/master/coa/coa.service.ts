import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Coa } from "./coa.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class CoaService {
  private baseUrl = "http://localhost:8000/api/coa";

  constructor(private http: HttpClient) {}

  getAll(): Observable<Coa[]> {
    return this.http.get<Coa[]>(this.baseUrl);
  }

  getById(id: number): Observable<Coa> {
    return this.http.get<Coa>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Coa>): Observable<Coa> {
    return this.http.post<Coa>(this.baseUrl, data);
  }

  update(id: number, data: Partial<Coa>): Observable<Coa> {
    return this.http.put<Coa>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  // 📤 Download template
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export-excel`, {
      responseType: "blob",
    });
  }

  // 📥 Import dari file Excel
  importExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import-excel`, formData);
  }
}
