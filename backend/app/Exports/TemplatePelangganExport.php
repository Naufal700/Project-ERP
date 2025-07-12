<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;

class TemplatePelangganExport implements FromArray
{
    public function array(): array
    {
        return [
            ['Nama', 'Email', 'Telepon', 'Alamat'],
            ['Contoh Nama', 'email@contoh.com', '08123456789', 'Contoh Alamat'], // Baris contoh
        ];
    }
}
