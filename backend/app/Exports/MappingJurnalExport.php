<?php

namespace App\Exports;

use App\Models\MappingJurnal;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class MappingJurnalExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return MappingJurnal::select(
            'kode_transaksi',
            'nama_transaksi',
            'kode_akun_debit',
            'kode_akun_kredit',
            'keterangan'
        )->get();
    }

    public function headings(): array
    {
        return ['Kode Transaksi', 'Nama Transaksi', 'Kode Akun Debit', 'Kode Akun Kredit', 'Keterangan'];
    }
}
