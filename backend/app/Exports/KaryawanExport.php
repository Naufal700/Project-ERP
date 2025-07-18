<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class KaryawanTemplateExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return [
            'nama_lengkap',
            'nip',
            'jenis_kelamin',
            'tanggal_lahir',
            'tempat_lahir',
            'alamat',
            'email',
            'no_hp',
            'jabatan',
            'divisi',
            'tanggal_masuk',
            'is_aktif'
        ];
    }

    public function array(): array
    {
        return [
            // contoh baris kosong untuk panduan
            ['John Doe', '123456', 'Laki-laki', '1990-01-01', 'Jakarta', 'Jl. Mawar 1', 'john@example.com', '08123456789', 'Staff', 'IT', '2020-01-01', true],
        ];
    }
}
