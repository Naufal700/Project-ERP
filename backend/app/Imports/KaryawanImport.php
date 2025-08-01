<?php

namespace App\Imports;

use App\Models\Karyawan;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class KaryawanImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Karyawan([
            'nama_lengkap'   => $row['nama_lengkap'],
            'nip'            => $row['nip'],
            'jenis_kelamin'  => $row['jenis_kelamin'],
            'tanggal_lahir'  => $this->transformDate($row['tanggal_lahir']),
            'tempat_lahir'   => $row['tempat_lahir'],
            'alamat'         => $row['alamat'],
            'email'          => $row['email'],
            'no_hp'          => $row['no_hp'],
            'jabatan'        => $row['jabatan'],
            'divisi'         => $row['divisi'],
            'tanggal_masuk'  => $this->transformDate($row['tanggal_masuk']),
            'is_aktif'       => $row['is_aktif'] ?? true,
        ]);
    }

    private function transformDate($value)
    {
        try {
            // Jika berupa angka (serial number Excel)
            if (is_numeric($value)) {
                return Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            // Jika sudah dalam format tanggal
            return \Carbon\Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null; // Jika gagal parsing, kembalikan null
        }
    }
}
