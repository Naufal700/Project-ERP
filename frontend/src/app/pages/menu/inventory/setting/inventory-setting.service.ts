import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InventorySettingsService {
  private baseUrl = "http://localhost:8000/api/inventory"; // sesuaikan URL backend

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/setting`);
  }

  updateSettings(data: { metode: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/setting`, data);
  }
}
