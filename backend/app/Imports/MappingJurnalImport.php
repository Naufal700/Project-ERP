<?php

namespace App\Imports;

use App\Models\MappingJurnal;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MappingJurnalImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new MappingJurnal([
            'kode_transaksi' => $row['kode_transaksi'],
            'nama_transaksi' => $row['nama_transaksi'],
            'kode_akun_debit' => $row['kode_akun_debit'],
            'kode_akun_kredit' => $row['kode_akun_kredit'],
            'keterangan' => $row['keterangan'] ?? null,
        ]);
    }
}
