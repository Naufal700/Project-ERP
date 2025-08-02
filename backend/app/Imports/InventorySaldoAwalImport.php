<?php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class InventorySaldoAwalImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Validasi data dasar
            if (!isset($row['kode_produk']) || !isset($row['qty']) || !isset($row['harga'])) {
                continue; // skip jika data tidak lengkap
            }

            $produk = DB::table('produk_m')->where('kode_produk', $row['kode_produk'])->first();

            if (!$produk) {
                continue; // skip jika produk tidak ditemukan
            }

            // Simpan saldo awal ke tabel inventory_opening_balance dengan id_gudang default 1
            DB::table('inventory_opening_balance')->updateOrInsert(
                [
                    'id_produk' => $produk->id,
                    'id_gudang' => 1, // default gudang
                ],
                [
                    'qty'   => $row['qty'],
                    'harga' => $row['harga'],
                    'total' => $row['qty'] * $row['harga'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
