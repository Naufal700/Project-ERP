<?php

namespace App\Imports;

use App\Models\Karyawan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class KaryawanImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Karyawan([
            'nama_lengkap'   => $row['nama_lengkap'],
            'nip'            => $row['nip'],
            'jenis_kelamin'  => $row['jenis_kelamin'],
            'tanggal_lahir'  => $row['tanggal_lahir'],
            'tempat_lahir'   => $row['tempat_lahir'],
            'alamat'         => $row['alamat'],
            'email'          => $row['email'],
            'no_hp'          => $row['no_hp'],
            'jabatan'        => $row['jabatan'],
            'divisi'         => $row['divisi'],
            'tanggal_masuk'  => $row['tanggal_masuk'],
            'is_aktif'       => filter_var($row['is_aktif'], FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
