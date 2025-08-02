<?php

namespace App\Http\Controllers\Api;

use App\Exports\InventoryExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\InventorySetting;
use App\Models\Produk;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventoryReportExport;
use App\Exports\InventorySaldoAwalExport;
use App\Imports\InventorySaldoAwalImport;

class InventoryReportController extends Controller
{
    public function getStockReport(Request $request)
    {
        $periode = $request->query('periode'); // ex: 2025-07-31
        $metode = InventorySetting::first()->metode ?? 'fifo';

        // Cek apakah sudah closing
        $isClosed = DB::table('inventory_period')
            ->where('periode', $periode)
            ->where('is_closed', true)
            ->exists();

        // Jika sudah closing, ambil data dari inventory_closing
        if ($isClosed) {
            $laporan = DB::table('inventory_closing as ic')
                ->join('produk_m as p', 'ic.produk_id', '=', 'p.id')
                ->leftJoin('kategori_produk as k', 'p.id_kategori', '=', 'k.id')
                ->leftJoin('satuan_m as s', 'p.id_satuan', '=', 's.id')
                ->where('ic.periode', $periode)
                ->select(
                    'p.kode_produk',
                    'p.nama_produk',
                    's.nama_satuan as satuan',
                    'k.nama_kategori as kategori',
                    'ic.metode',
                    'ic.qty_akhir as qty',
                    'ic.harga_akhir as harga',
                    'ic.total_nilai as total'
                )
                ->get()
                ->map(function ($item) {
                    return [
                        'kode_produk' => $item->kode_produk,
                        'nama_produk' => $item->nama_produk,
                        'satuan'      => $item->satuan ?? '-',
                        'kategori'    => $item->kategori ?? '-',
                        'metode'      => strtoupper($item->metode),
                        'saldo_awal'  => null,
                        'penerimaan'  => null,
                        'pengeluaran' => null,
                        'sisa_stok'   => [
                            'qty'   => $item->qty,
                            'harga' => $item->harga,
                            'total' => $item->total,
                        ]
                    ];
                });

            return response()->json($laporan);
        }

        // Jika belum closing, gunakan perhitungan real-time (kode lama)
        $produkList = Produk::with(['kategori', 'satuan'])->get();
        $laporan = [];

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

            $totalSisa = $sisaQty * $hargaSisa;

            $laporan[] = [
                'kode_produk'    => $produk->kode_produk,
                'nama_produk'    => $produk->nama_produk,
                'satuan'         => $produk->satuan->nama_satuan ?? '-',
                'kategori'       => $produk->kategori->nama_kategori ?? '-',
                'metode'         => strtoupper($metode),
                'saldo_awal'     => [
                    'qty'   => $saldoAwal->qty,
                    'harga' => $hargaSisa,
                    'total' => $saldoAwal->qty * $hargaSisa,
                ],
                'penerimaan'     => [
                    'qty'            => $penerimaan->qty,
                    'harga'          => $hargaSisa,
                    'total'          => $penerimaan->qty * $hargaSisa,
                    'retur_supplier' => $returSupplier->qty,
                    'selisih_so'     => $selisihSO->qty,
                ],
                'pengeluaran'    => [
                    'qty'            => $pengeluaran->qty,
                    'harga'          => $hargaSisa,
                    'total'          => $pengeluaran->qty * $hargaSisa,
                    'retur_pembeli'  => $returPembeli->qty,
                    'selisih_so'     => $selisihSO->qty,
                ],
                'sisa_stok'      => [
                    'qty'   => $sisaQty,
                    'harga' => $hargaSisa,
                    'total' => $totalSisa,
                ]
            ];
        }

        return response()->json($laporan);
    }

    public function exportStockReport(Request $request)
    {
        $tanggal = $request->query('tanggal');
        return Excel::download(new InventoryExport($tanggal), 'laporan-persediaan.xlsx');
    }

    public function downloadTemplate()
    {
        return Excel::download(new InventorySaldoAwalExport(null, true), 'template-saldo-awal.xlsx');
    }

    public function importStockReport(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        Excel::import(new InventorySaldoAwalImport(), $request->file('file'));

        return response()->json(['message' => 'Import saldo awal berhasil']);
    }
}
