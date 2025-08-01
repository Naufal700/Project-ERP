<?php

namespace App\Exports;

use App\Models\Pelanggan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PelangganExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Pelanggan::select('kode_pelanggan', 'nama_pelanggan', 'email', 'telepon', 'alamat')->get();
    }

    public function headings(): array
    {
        return [
            'Kode Pelanggan',
            'Nama Pelanggan',
            'Email',
            'Telepon',
            'Alamat'
        ];
    }
}
