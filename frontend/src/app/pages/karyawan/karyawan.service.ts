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
  private baseUrl = "/api/karyawan"; // sesuaikan dengan API Laravel

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(data: Karyawan): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  update(id: number, data: Karyawan): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  /**
   * Download template Excel karyawan
   */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-template`, {
      responseType: "blob",
    });
  }

  /**
   * Import data karyawan dari file Excel
   */
  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<any>(`${this.baseUrl}/import`, formData);
  }
}
