import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

// Tipe untuk Produk
export interface Produk {
  id: number;
  kode_produk: string;
  nama_produk: string;
  deskripsi: string | null;
  is_aktif: boolean;
  kategori: {
    id: number;
    kode_kategori: string;
    nama_kategori: string;
  };
  satuan: {
    id: number;
    kode_satuan: string;
    nama_satuan: string;
  };
}

// Tipe untuk Harga Jual
export interface HargaJual {
  id: number;
  id_produk: number;
  harga: number;
  tanggal_mulai: string;
  tanggal_berakhir?: string | null;
  produk?: Produk;
}

@Injectable({
  providedIn: "root",
})
export class HargaJualService {
  private baseUrl = `${environment.apiUrl}/harga-jual`;
  private produkUrl = `${environment.apiUrl}/produk`;

  constructor(private http: HttpClient) {}

  // Ambil semua data harga jual
  getAll(params?: any): Observable<HargaJual[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http
      .get<HargaJual[]>(this.baseUrl, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Ambil data produk
  getProduk(): Observable<Produk[]> {
    return this.http
      .get<Produk[]>(this.produkUrl)
      .pipe(catchError(this.handleError));
  }

  // Tambah harga jual baru
  create(data: Partial<HargaJual>): Observable<any> {
    return this.http
      .post(this.baseUrl, data)
      .pipe(catchError(this.handleError));
  }

  // Update harga jual
  update(id: number, data: Partial<HargaJual>): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // Hapus harga jual
  delete(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: any) {
    console.error("API Error:", error);
    return throwError(() => error);
  }
}
