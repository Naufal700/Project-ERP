import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CaraBayar } from "./cara-bayar.model";

@Injectable({ providedIn: "root" })
export class CaraBayarService {
  private apiUrl = "/api/cara-bayar";

  constructor(private http: HttpClient) {}

  getAll(): Observable<CaraBayar[]> {
    return this.http.get<CaraBayar[]>(this.apiUrl);
  }

  create(data: Partial<CaraBayar>): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: Partial<CaraBayar>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
