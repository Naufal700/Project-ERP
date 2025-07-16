<?php

namespace App\Imports;

use App\Models\Produk;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProdukImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Validasi setiap baris (opsional)
        Validator::make($row, [
            'kode_produk' => 'required',
            'nama_produk' => 'required',
        ])->validate();

        return new Produk([
            'kode_produk' => $row['kode_produk'],
            'nama_produk' => $row['nama_produk'],
            'id_kategori' => $row['id_kategori'] ?? null,
            'id_satuan' => $row['id_satuan'] ?? null,
            'deskripsi' => $row['deskripsi'] ?? null,
            'is_aktif' => $row['is_aktif'] ?? true,
        ]);
    }
}
