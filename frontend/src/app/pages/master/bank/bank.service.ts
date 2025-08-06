import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BankService {
  private baseUrl = "/api/bank";

  constructor(private http: HttpClient) {}

  getBanks(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getCaraBayar(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cara-bayar`);
  }

  createBank(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  updateBank(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  deleteBank(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
