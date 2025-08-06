import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CaraBayarService {
  private baseUrl = "/api/cara-bayar";

  constructor(private http: HttpClient) {}

  getCaraBayar(): Observable<any> {
    return this.http.get("/api/bank/cara-bayar");
  }

  createCaraBayar(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  updateCaraBayar(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  deleteCaraBayar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
