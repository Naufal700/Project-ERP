<?php

namespace App\Exports;

use App\Models\Produk;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InventorySaldoAwalExport implements FromCollection, WithHeadings, WithMapping
{
    protected $isTemplate;

    public function __construct($isTemplate = false)
    {
        $this->isTemplate = $isTemplate;
    }

    public function collection()
    {
        // Ambil semua produk
        $produkList = Produk::select('id', 'kode_produk', 'nama_produk', 'harga_beli')->get();

        // Ambil saldo awal
        $saldoAwal = DB::table('inventory_opening_balance')
            ->select('id_produk', DB::raw('COALESCE(SUM(qty),0) as qty'), DB::raw('COALESCE(SUM(harga),0) as harga'))
            ->groupBy('id_produk')
            ->pluck('qty', 'id_produk')
            ->toArray();

        $hargaAwal = DB::table('inventory_opening_balance')
            ->select('id_produk', DB::raw('COALESCE(SUM(harga),0) as harga'))
            ->groupBy('id_produk')
            ->pluck('harga', 'id_produk')
            ->toArray();

        return $produkList->map(function ($produk) use ($saldoAwal, $hargaAwal) {
            return (object) [
                'kode_produk' => $produk->kode_produk,
                'nama_produk' => $produk->nama_produk,
                'qty'        => $saldoAwal[$produk->id] ?? '',
                'harga'      => $hargaAwal[$produk->id] ?? $produk->harga_beli,
                'total'      => '', // Total tidak perlu, user akan input di Excel jika mau
            ];
        });
    }

    public function headings(): array
    {
        return ['Kode Produk', 'Nama Produk', 'Qty', 'Harga', 'Total'];
    }

    public function map($row): array
    {
        return [
            $row->kode_produk,
            $row->nama_produk,
            $row->qty,
            $row->harga,
            '' // Total kosong, hanya referensi
        ];
    }
}
