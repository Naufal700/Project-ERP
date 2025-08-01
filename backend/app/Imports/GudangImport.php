<?php

namespace App\Imports;

use App\Models\Gudang;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class GudangImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Gudang([
            'kode_gudang'      => $row['kode_gudang'],
            'nama_gudang'      => $row['nama_gudang'],
            'alamat'           => $row['alamat'],
            'penanggung_jawab' => $row['penanggung_jawab'],
            'status'           => strtolower($row['status']) === 'nonaktif' ? 'nonaktif' : 'aktif',
        ]);
    }
}
