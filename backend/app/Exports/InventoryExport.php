<?php

namespace App\Exports;

use App\Models\InventorySetting;
use App\Models\Produk;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExport implements FromCollection, WithHeadings, WithStyles
{
    protected $tanggal;

    public function __construct($tanggal = null)
    {
        $this->tanggal = $tanggal;
    }

    public function collection()
    {
        $metode = InventorySetting::first()->metode ?? 'fifo';
        $produkList = Produk::with(['kategori', 'satuan'])->get();
        $data = [];

        foreach ($produkList as $produk) {
            $saldoAwal = DB::table('inventory_opening_balance')
                ->where('id_produk', $produk->id)
                ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                ->first();

            $penerimaan = DB::table('inventory_receipts')
                ->where('produk_id', $produk->id)
                ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                ->first();

            $returSupplier = DB::table('purchase_returns')
                ->where('produk_id', $produk->id)
                ->selectRaw('COALESCE(SUM(qty),0) as qty')
                ->first();

            $selisihSO = DB::table('stock_opname')
                ->where('produk_id', $produk->id)
                ->selectRaw('COALESCE(SUM(selisih_qty),0) as qty')
                ->first();

            $pengeluaran = DB::table('inventory_issues')
                ->where('produk_id', $produk->id)
                ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                ->first();

            $returPembeli = DB::table('sales_returns')
                ->where('produk_id', $produk->id)
                ->selectRaw('COALESCE(SUM(qty),0) as qty')
                ->first();

            $sisaQty = ($saldoAwal->qty + $penerimaan->qty + $selisihSO->qty)
                - ($pengeluaran->qty + $returSupplier->qty + $returPembeli->qty);

            if ($metode === 'average') {
                $totalNilai = $saldoAwal->total + $penerimaan->total;
                $totalQty = $saldoAwal->qty + $penerimaan->qty;
                $hargaSisa = $totalQty > 0 ? $totalNilai / $totalQty : $produk->harga_beli;
            } else {
                $hargaSisa = $produk->harga_beli ?? 0;
            }

            $data[] = [
                $produk->kode_produk,
                $produk->nama_produk,
                $produk->satuan->nama_satuan ?? '-',
                $produk->kategori->nama_kategori ?? '-',
                $saldoAwal->qty,
                $hargaSisa,
                $saldoAwal->qty * $hargaSisa,
                $penerimaan->qty,
                $hargaSisa,
                $penerimaan->qty * $hargaSisa,
                $returSupplier->qty,
                $selisihSO->qty,
                $pengeluaran->qty,
                $hargaSisa,
                $pengeluaran->qty * $hargaSisa,
                $returPembeli->qty,
                $selisihSO->qty,
                $sisaQty,
                $hargaSisa,
                $sisaQty * $hargaSisa
            ];
        }

        return collect($data);
    }

    public function headings(): array
    {
        return [
            'Kode Produk',
            'Nama Produk',
            'Satuan',
            'Kategori',
            'Saldo Awal Qty',
            'Saldo Awal Harga',
            'Saldo Awal Total',
            'Penerimaan Qty',
            'Penerimaan Harga',
            'Penerimaan Total',
            'Retur Supplier',
            'Selisih SO',
            'Pengeluaran Qty',
            'Pengeluaran Harga',
            'Pengeluaran Total',
            'Retur Pembeli',
            'Selisih SO',
            'Sisa Stok Qty',
            'Sisa Stok Harga',
            'Sisa Stok Total'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:T1')->getFont()->setBold(true);
        return [];
    }
}
