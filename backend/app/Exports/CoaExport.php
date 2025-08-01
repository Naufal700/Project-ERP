<?php

namespace App\Exports;

use App\Models\Coa;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CoaExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Coa::select(
            'kode_akun',
            'nama_akun',
            'level_akun',
            'parent_kode_akun',
            'kategori_akun',
            'tipe_akun',
            'kategori_laporan',
            'saldo_normal',
            'saldo_awal',
            'is_header',
            'is_aktif',
            'keterangan'
        )->get();
    }

    public function headings(): array
    {
        return [
            'Kode Akun',
            'Nama Akun',
            'Level Akun',
            'Parent Kode Akun',
            'Kategori Akun',
            'Tipe Akun',
            'Kategori Laporan',
            'Saldo Normal',
            'Saldo Awal',
            'Is Header',
            'Is Aktif',
            'Keterangan'
        ];
    }
}
