<?php

namespace App\Imports;

use App\Models\Coa;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CoaImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Coa([
            'kode_akun'       => $row['kode_akun'],
            'nama_akun'       => $row['nama_akun'],
            'level_akun'      => $row['level_akun'],
            'parent_kode_akun' => $row['parent_kode_akun'] ?? null,
            'kategori_akun'   => $row['kategori_akun'] ?? null,
            'tipe_akun'       => $row['tipe_akun'] ?? null,
            'kategori_laporan' => $row['kategori_laporan'] ?? null,
            'saldo_normal'    => $row['saldo_normal'],
            'saldo_awal'      => $row['saldo_awal'] ?? 0,
            'is_header'       => $row['is_header'] ?? false,
            'is_aktif'        => $row['is_aktif'] ?? true,
            'keterangan'      => $row['keterangan'] ?? null,
        ]);
    }
}
