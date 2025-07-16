<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class TemplateProdukExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return collect([]); // Template kosong
    }

    public function headings(): array
    {
        return [
            'kode_produk',
            'nama_produk',
            'id_kategori',
            'id_satuan',
            'deskripsi',
            'is_aktif',
        ];
    }
}
