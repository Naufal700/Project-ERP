import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MappingJurnalService {
  private baseUrl = "http://localhost:8000/api"; // base URL

  constructor(private http: HttpClient) {}

  // CRUD Mapping Jurnal
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/mapping-jurnal`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/mapping-jurnal`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/mapping-jurnal/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/mapping-jurnal/${id}`);
  }

  // Dropdown COA
  getCOA(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/mapping-jurnal/coa/list`);
  }

  // Dropdown Cara Bayar
  getCaraBayar(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/mapping-jurnal/cara-bayar/list`
    );
  }

  // Dropdown Bank
  getBank(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/mapping-jurnal/bank/list`);
  }
}
