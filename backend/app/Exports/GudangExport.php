<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class GudangExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return collect([
            [
                'kode_gudang' => 'G001',
                'nama_gudang' => 'Gudang Utama',
                'alamat' => 'Jl. Raya No. 123',
                'penanggung_jawab' => 'Budi Santoso',
                'status' => 'aktif',
            ],
        ]);
    }

    public function headings(): array
    {
        return [
            'kode_gudang',
            'nama_gudang',
            'alamat',
            'penanggung_jawab',
            'status',
        ];
    }
}
