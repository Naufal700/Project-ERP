<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Collection;

class SupplierExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return new Collection([
            ['SUP001', 'Supplier Contoh', 'Jl. Contoh No. 123', 'supplier@email.com', '08123456789', '01.234.567.8-901.000', '30 Hari', 'Bahan Baku'],
        ]);
    }

    public function headings(): array
    {
        return [
            'Kode Supplier',
            'Nama Supplier',
            'Alamat',
            'Email',
            'No Telepon',
            'NPWP',
            'Termin Pembayaran',
            'Kategori',
        ];
    }
}
