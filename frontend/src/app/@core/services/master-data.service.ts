import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Bank {
  id: number;
  nama_bank: string;
  // field lain sesuai API
}

export interface CaraBayar {
  id: number;
  nama_cara_bayar: string;
  // field lain sesuai API
}

@Injectable({
  providedIn: "root",
})
export class MasterDataService {
  private baseUrl = "/api"; // sesuaikan

  constructor(private http: HttpClient) {}

  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(`${this.baseUrl}/bank`);
  }

  getCaraBayar(): Observable<CaraBayar[]> {
    return this.http.get<CaraBayar[]>(`${this.baseUrl}/cara-bayar`);
  }
}
