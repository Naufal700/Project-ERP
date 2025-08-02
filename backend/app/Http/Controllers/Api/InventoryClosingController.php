<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\InventorySetting;
use App\Models\Produk;
use App\Models\JurnalUmum;

class InventoryClosingController extends Controller
{
    public function closing(Request $request)
    {
        $periode = $request->periode; // ex: 2025-07-31
        $userId = auth()->id();

        // Cek jika sudah closing
        $check = DB::table('inventory_period')->where('periode', $periode)->first();
        if ($check && $check->is_closed) {
            return response()->json(['message' => 'Periode ini sudah closing'], 400);
        }

        // Ambil metode inventory
        $metode = InventorySetting::first()->metode ?? 'fifo';

        DB::beginTransaction();
        try {
            // Ambil semua produk
            $produkList = Produk::all();

            foreach ($produkList as $produk) {
                // Hitung saldo awal
                $saldoAwal = DB::table('inventory_opening_balance')
                    ->where('id_produk', $produk->id)
                    ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                    ->first();

                // Penerimaan
                $penerimaan = DB::table('inventory_receipts')
                    ->where('produk_id', $produk->id)
                    ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                    ->first();

                // Pengeluaran
                $pengeluaran = DB::table('inventory_issues')
                    ->where('produk_id', $produk->id)
                    ->selectRaw('COALESCE(SUM(qty),0) as qty, COALESCE(SUM(total),0) as total')
                    ->first();

                $sisaQty = ($saldoAwal->qty + $penerimaan->qty) - $pengeluaran->qty;

                // Hitung harga akhir
                if ($metode === 'average') {
                    $totalNilai = $saldoAwal->total + $penerimaan->total;
                    $totalQty = $saldoAwal->qty + $penerimaan->qty;
                    $hargaAkhir = $totalQty > 0 ? $totalNilai / $totalQty : $produk->harga_beli;
                } else {
                    // FIFO: ambil harga dari batch terakhir
                    $hargaAkhir = $produk->harga_beli ?? 0;
                }

                $totalNilaiAkhir = $sisaQty * $hargaAkhir;

                // Simpan ke inventory_closing
                DB::table('inventory_closing')->insert([
                    'periode'      => $periode,
                    'produk_id'    => $produk->id,
                    'metode'       => $metode,
                    'qty_akhir'    => $sisaQty,
                    'harga_akhir'  => $hargaAkhir,
                    'total_nilai'  => $totalNilaiAkhir,
                    'created_by'   => $userId,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }

            // Simpan status closing
            DB::table('inventory_period')->updateOrInsert(
                ['periode' => $periode],
                ['is_closed' => true, 'updated_at' => now()]
            );

            // Buat jurnal penyesuaian
            $this->buatJurnalClosing($periode, $metode);

            DB::commit();
            return response()->json(['message' => 'Closing persediaan berhasil']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function buatJurnalClosing($periode, $metode)
    {
        // Ambil total nilai persediaan
        $totalNilai = DB::table('inventory_closing')
            ->where('periode', $periode)
            ->sum('total_nilai');

        // Ambil mapping akun
        // $mapping = DB::table('mapping_jurnal')
        //     ->where('jenis_transaksi', 'closing_inventory')
        //     ->first();

        // if (!$mapping) {
        //     throw new \Exception('Mapping jurnal untuk closing_inventory belum diatur');
        // }

        // Buat jurnal
        // DB::table('jurnal_umum')->insert([
        //     'tanggal' => $periode,
        //     'kode_akun_debit' => $mapping->kode_akun_debit,
        //     'kode_akun_kredit' => $mapping->kode_akun_kredit,
        //     'nominal' => $totalNilai,
        //     'keterangan' => 'Closing persediaan periode ' . $periode . ' (' . strtoupper($metode) . ')',
        //     'created_at' => now(),
        //     'updated_at' => now(),
        // ]);
    }
    public function checkClosingStatus(Request $request)
    {
        $periode = $request->query('periode');

        $isClosed = DB::table('inventory_period')
            ->where('periode', $periode)
            ->where('is_closed', true)
            ->exists();

        return response()->json(['is_closed' => $isClosed]);
    }
}
