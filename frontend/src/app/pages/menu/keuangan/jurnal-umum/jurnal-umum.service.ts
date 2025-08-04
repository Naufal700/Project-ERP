import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

// Interface untuk detail jurnal yang diambil dan ditampilkan (dengan debit dan kredit)
export interface JurnalDetail {
  kode_akun: string;
  nama_akun?: string;
  debit: number;
  kredit: number;
  keterangan?: string;
}

// Interface khusus untuk detail jurnal saat kirim data ke backend
export interface JurnalPayloadDetail {
  kode_akun: string;
  jenis: "debit" | "kredit";
  nominal: number;
  keterangan?: string;
}

// Interface header jurnal, dengan details bisa bertipe JurnalDetail[] (untuk GET) atau JurnalPayloadDetail[] (untuk POST/PUT)
export interface JurnalHeader {
  id?: number;
  tanggal: string;
  kode_jurnal?: string;
  keterangan: string;
  total_debit?: number;
  total_kredit?: number;
  details?: JurnalDetail[] | JurnalPayloadDetail[];
}

@Injectable({ providedIn: "root" })
export class JurnalUmumService {
  private baseUrl = "http://localhost:8000/api/jurnal-umum";

  constructor(private http: HttpClient) {}

  /** Ambil daftar jurnal dengan pagination & filter */
  list(page: number, filter: any, perPage: number = 10): Observable<any> {
    let params = new HttpParams().set("page", page).set("per_page", perPage);

    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        params = params.set(key, filter[key]);
      }
    });

    return this.http.get<any>(this.baseUrl, { params });
  }

  /** Ambil jurnal berdasarkan ID */
  getById(id: number): Observable<JurnalHeader> {
    return this.http.get<JurnalHeader>(`${this.baseUrl}/${id}`);
  }

  /** Simpan jurnal baru */
  create(data: JurnalHeader): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  /** Update jurnal */
  update(id: number, data: JurnalHeader): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  /** Hapus jurnal */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  /** Download template excel */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download-template`, {
      responseType: "blob",
    });
  }

  /** Export data jurnal ke Excel */
  exportExcel(filter: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        params = params.set(key, filter[key]);
      }
    });

    return this.http.get(`${this.baseUrl}/export-excel`, {
      params,
      responseType: "blob",
    });
  }

  /** Import jurnal dari Excel */
  importExcel(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/import-excel`, formData);
  }

  /** Ambil detail jurnal (dengan coa) */
  getDetail(id: number): Observable<JurnalHeader> {
    return this.http.get<JurnalHeader>(`${this.baseUrl}/${id}`);
  }
}
