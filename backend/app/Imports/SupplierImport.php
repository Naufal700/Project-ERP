<?php

namespace App\Imports;

use App\Models\Supplier;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SupplierImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Supplier([
            'kode_supplier'      => $row['kode_supplier'],
            'nama_supplier'      => $row['nama_supplier'],
            'alamat'             => $row['alamat'] ?? null,
            'email'              => $row['email'] ?? null,
            'no_telepon'         => $row['no_telepon'] ?? null,
            'npwp'               => $row['npwp'] ?? null,
            'termin_pembayaran'  => $row['termin_pembayaran'] ?? null,
            'kategori'           => $row['kategori'] ?? null,
        ]);
    }
}
