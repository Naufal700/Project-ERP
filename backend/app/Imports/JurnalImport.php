<?php

namespace App\Imports;

use App\Models\JurnalUmum;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class JurnalImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Validasi sederhana
            if (
                empty($row['tanggal']) ||
                empty($row['kode_akun']) ||
                empty($row['jenis']) ||
                empty($row['nominal'])
            ) {
                continue; // skip baris yang kurang data wajib
            }

            // Simpan ke database, sesuaikan kolom db
            JurnalUmum::create([
                'tanggal'    => $row['tanggal'],
                'kode_akun'  => $row['kode_akun'],
                'jenis'      => strtolower($row['jenis']),
                'nominal'    => $row['nominal'],
                'keterangan' => $row['keterangan'] ?? null,
                'reference'  => $row['reference'] ?? null,
                'created_by' => auth()->id(),
            ]);
        }
    }
}
