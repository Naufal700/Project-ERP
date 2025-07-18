import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface Karyawan {
  id?: number;
  nama_lengkap: string;
  nip: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  email: string;
  no_hp: string;
  jabatan: string;
  divisi: string;
  tanggal_masuk: string;
  is_aktif: boolean;
}

@Injectable({
  providedIn: "root",
})
export class KaryawanService {
  private baseUrl = "/api/karyawan"; // sesuaikan sesuai route API kamu

  constructor(private http: HttpClient) {}

  getAll(): Observable<Karyawan[]> {
    return this.http.get<Karyawan[]>(this.baseUrl);
  }

  getById(id: number): Observable<Karyawan> {
    return this.http.get<Karyawan>(`${this.baseUrl}/${id}`);
  }

  create(data: Karyawan): Observable<Karyawan> {
    return this.http.post<Karyawan>(this.baseUrl, data);
  }

  update(id: number, data: Karyawan): Observable<Karyawan> {
    return this.http.put<Karyawan>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
