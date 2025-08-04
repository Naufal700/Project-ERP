<?php

namespace App\Http\Controllers\Api;

use App\Exports\InventoryExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\InventorySetting;
use App\Models\Produk;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\InventorySaldoAwalExport;
use App\Imports\InventorySaldoAwalImport;
use Carbon\Carbon;

class InventoryReportController extends Controller
{
    public function getStockReport(Request $request)
    {
        $periode = $request->query('periode'); // ex: 2025-08
        $metode = InventorySetting::first()->metode ?? 'fifo';

        // Convert periode "YYYY-MM" → YYYY-MM-01
        $periodeDate = $periode
            ? Carbon::parse(strlen($periode) === 7 ? $periode . '-01' : $periode)
            : now();

        $bulan = $periodeDate->month;
        $tahun = $periodeDate->year;

        // Cek apakah sudah closing
        $isClosed = DB::table('inventory_period')
            ->where('periode', $periodeDate->startOfMonth()->format('Y-m-d'))
            ->where('is_closed', true)
            ->exists();

        // Jika sudah closing → ambil langsung dari inventory_closing
        if ($isClosed) {
            $laporan = DB::table('inventory_closing as ic')
                ->join('produk_m as p', 'ic.produk_id', '=', 'p.id')
                ->leftJoin('kategori_produk as k', 'p.id_kategori', '=', 'k.id')
                ->leftJoin('satuan_m as s', 'p.id_satuan', '=', 's.id')
                ->where('periode', $periodeDate->format('Y-m'))
                ->where('p.jenis_produk', 'persediaan') // ✅ filter produk inventory
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

        // Jika belum closing → hitung real-time
        $produkList = Produk::with(['kategori', 'satuan'])
            ->where('jenis_produk', 'persediaan') // ✅ filter produk inventory
            ->get();

        $laporan = [];

        // Ambil periode pertama dari opening balance
        $firstOpening = DB::table('inventory_opening_balance')
            ->selectRaw('MIN(periode) as periode')
            ->first();

        $firstOpeningDate = $firstOpening ? Carbon::parse($firstOpening->periode) : null;

        foreach ($produkList as $produk) {
            // 1️⃣ Jika periode sekarang adalah periode pertama import → ambil dari inventory_opening_balance
            if ($firstOpeningDate && $periodeDate->equalTo($firstOpeningDate)) {
                $saldoAwal = DB::table('inventory_opening_balance')
                    ->where('id_produk', $produk->id)
                    ->whereDate('periode', $periodeDate->startOfMonth()->format('Y-m-d'))
                    ->selectRaw('COALESCE(qty,0) as qty, COALESCE(total,0) as total')
                    ->first() ?? (object) ['qty' => 0, 'total' => 0];
            } else {
                // Ambil saldo awal dari inventory_closing bulan sebelumnya
                $prevPeriode = $periodeDate->copy()->subMonth();
                $saldoAwal = DB::table('inventory_closing')
                    ->where('produk_id', $produk->id)
                    ->where('periode', $prevPeriode->format('Y-m'))
                    ->selectRaw('qty_akhir as qty, (qty_akhir * harga_akhir) as total')
                    ->first() ?? (object) ['qty' => 0, 'total' => 0];
            }

            // Penerimaan
            $penerimaan = DB::table('inventory_receipts')
                ->where('produk_id', $produk->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                ->first();

            // Retur Supplier
            $returSupplier = DB::table('purchase_returns')
                ->where('produk_id', $produk->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->selectRaw('COALESCE(SUM(qty),0) as qty')
                ->first();

            // Selisih SO
            $selisihSO = DB::table('stock_opname')
                ->where('produk_id', $produk->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->selectRaw('COALESCE(SUM(selisih_qty),0) as qty')
                ->first();

            // Pengeluaran
            $pengeluaran = DB::table('inventory_issues')
                ->where('produk_id', $produk->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                ->first();

            // Retur Pembeli
            $returPembeli = DB::table('sales_returns')
                ->where('produk_id', $produk->id)
                ->whereMonth('tanggal', $bulan)
                ->whereYear('tanggal', $tahun)
                ->selectRaw('COALESCE(SUM(qty),0) as qty')
                ->first();

            // Hitung sisa stok
            $sisaQty = ($saldoAwal->qty + $penerimaan->qty + $selisihSO->qty)
                - ($pengeluaran->qty + $returSupplier->qty + $returPembeli->qty);

            // Harga sisa
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

    public function downloadTemplate(Request $request)
    {
        $periode = $request->query('periode');
        $periode = strlen($periode) === 7 ? $periode . '-01' : $periode;
        return Excel::download(new InventorySaldoAwalExport($periode, true), 'template-saldo-awal.xlsx');
    }

    public function importStockReport(Request $request)
    {
        $request->validate([
            'file'    => 'required|mimes:xlsx,xls',
            'periode' => 'required'
        ]);

        $periode = strlen($request->periode) === 7 ? $request->periode . '-01' : $request->periode;
        Excel::import(new InventorySaldoAwalImport($periode), $request->file('file'));

        return response()->json(['message' => 'Import saldo awal berhasil']);
    }

    public function closingStock(Request $request)
    {
        $request->validate([
            'periode' => 'required'
        ]);

        $periode = Carbon::parse(strlen($request->periode) === 7 ? $request->periode . '-01' : $request->periode);

        DB::beginTransaction();
        try {
            $laporan = $this->getStockReport(new Request(['periode' => $periode->format('Y-m')]))->getData(true);

            foreach ($laporan as $item) {
                $produkId = DB::table('produk_m')
                    ->where('kode_produk', $item['kode_produk'])
                    ->where('jenis_produk', 'persediaan') // ✅ hanya inventory
                    ->value('id');

                if (!$produkId) continue;

                DB::table('inventory_closing')->updateOrInsert(
                    [
                        'produk_id' => $produkId,
                        'periode'   => $periode->startOfMonth()->format('Y-m-d')
                    ],
                    [
                        'metode'      => strtolower($item['metode']),
                        'qty_akhir'   => $item['sisa_stok']['qty'],
                        'harga_akhir' => $item['sisa_stok']['harga'],
                        'total_nilai' => $item['sisa_stok']['total'],
                        'updated_at'  => now(),
                        'created_at'  => now(),
                    ]
                );
            }

            DB::table('inventory_period')->updateOrInsert(
                ['periode' => $periode->startOfMonth()->format('Y-m-d')],
                ['is_closed' => true, 'updated_at' => now(), 'created_at' => now()]
            );

            DB::commit();
            return response()->json(['message' => 'Closing stok berhasil']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal closing stok', 'error' => $e->getMessage()], 500);
        }
    }
}
