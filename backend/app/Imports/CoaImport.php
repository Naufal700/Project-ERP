<?php

namespace App\Imports;

use App\Models\Coa;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CoaImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Default saldo normal berdasarkan kategori laporan
        $defaultSaldoNormal = in_array(strtolower($row['kategori_akun'] ?? ''), [
            'aset lancar',
            'aset tetap',
            'beban'
        ]) ? 'debit' : 'kredit';

        return new Coa([
            'kode_akun'        => $row['kode_akun'],
            'nama_akun'        => $row['nama_akun'],
            'level_akun'       => $row['level_akun'],
            'parent_kode_akun' => !empty($row['parent_kode_akun']) ? $row['parent_kode_akun'] : null,
            'kategori_akun'    => $row['kategori_akun'] ?? null,
            'tipe_akun'        => $row['tipe_akun'] ?? null,
            'kategori_laporan' => $row['kategori_laporan'] ?? null,
            'saldo_normal'     => strtolower(trim($row['saldo_normal'] ?? $defaultSaldoNormal)),
            'saldo_awal'       => $row['saldo_awal'] ?? 0,
            'is_header'        => empty($row['parent_kode_akun']), // parent kosong → header
            'is_aktif'         => !isset($row['is_aktif']) || $row['is_aktif'] == 1,
            'keterangan'       => $row['keterangan'] ?? null,
        ]);
    }
}
