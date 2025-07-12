<?php

namespace App\Imports;

use App\Models\Pelanggan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PelangganImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Pelanggan([
            'nama'    => $row['nama'],
            'email'   => $row['email'],
            'telepon' => $row['telepon'],
            'alamat'  => $row['alamat'],
        ]);
    }
}
