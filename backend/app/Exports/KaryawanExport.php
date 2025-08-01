<?php

namespace App\Exports;

use App\Models\Karyawan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class KaryawanExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Karyawan::select(
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
        )->get();
    }

    public function headings(): array
    {
        return [
            'Nama Lengkap',
            'NIP',
            'Jenis Kelamin',
            'Tanggal Lahir',
            'Tempat Lahir',
            'Alamat',
            'Email',
            'No HP',
            'Jabatan',
            'Divisi',
            'Tanggal Masuk',
            'Aktif'
        ];
    }
}
