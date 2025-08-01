<?php

namespace App\Exports;

use App\Models\Produk;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProdukExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Produk::with(['kategori', 'satuan'])
            ->get()
            ->map(function ($produk) {
                return [
                    'kode_produk' => $produk->kode_produk,
                    'nama_produk' => $produk->nama_produk,
                    'kategori'    => $produk->kategori?->nama_kategori,
                    'satuan'      => $produk->satuan?->nama_satuan,
                    'harga_beli'  => $produk->harga_beli,
                    'harga_jual'  => $produk->harga_jual,
                    'is_aktif'    => $produk->is_aktif ? 'Aktif' : 'Tidak Aktif',
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Kode Produk',
            'Nama Produk',
            'Kategori',
            'Satuan',
            'Harga Beli',
            'Harga Jual',
            'Status',
        ];
    }
}
