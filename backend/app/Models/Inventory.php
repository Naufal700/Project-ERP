<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class Inventory
{
    /**
     * Ambil setting metode persediaan.
     */
    public function getSetting()
    {
        return DB::table('inventory_settings')->first();
    }

    public function updateSetting($metode)
    {
        $setting = DB::table('inventory_settings')->first();
        if ($setting) {
            DB::table('inventory_settings')->update(['metode' => $metode]);
        } else {
            DB::table('inventory_settings')->insert(['metode' => $metode]);
        }
    }

    /**
     * Saldo awal persediaan.
     */
    public function getOpeningBalance()
    {
        return DB::table('produk_m')
            ->crossJoin('gudang_m') // ambil kombinasi semua produk & gudang
            ->leftJoin('inventory_opening_balance', function ($join) {
                $join->on('produk_m.id', '=', 'inventory_opening_balance.id_produk')
                    ->on('gudang_m.id', '=', 'inventory_opening_balance.id_gudang');
            })
            ->select(
                'produk_m.id as id_produk',
                'produk_m.nama_produk',
                'gudang_m.id as id_gudang',
                'gudang_m.nama_gudang',
                DB::raw('COALESCE(inventory_opening_balance.qty, 0) as qty'),
                DB::raw('COALESCE(inventory_opening_balance.harga, 0) as harga'),
                DB::raw('COALESCE(inventory_opening_balance.total, 0) as total')
            )
            ->orderBy('produk_m.nama_produk')
            ->orderBy('gudang_m.nama_gudang')
            ->get();
    }

    public function storeOpeningBalance($data)
    {
        $data['total'] = $data['qty'] * $data['harga'];
        return DB::table('inventory_opening_balance')->insert($data);
    }

    /**
     * Mutasi gudang.
     */
    public function getMutations()
    {
        return DB::table('inventory_mutations')
            ->join('produk_m', 'inventory_mutations.id_produk', '=', 'produk_m.id')
            ->leftJoin('gudang_m as g1', 'inventory_mutations.id_gudang_asal', '=', 'g1.id')
            ->leftJoin('gudang_m as g2', 'inventory_mutations.id_gudang_tujuan', '=', 'g2.id')
            ->select(
                'inventory_mutations.*',
                'produk_m.nama_produk',
                'g1.nama_gudang as gudang_asal',
                'g2.nama_gudang as gudang_tujuan'
            )
            ->get();
    }

    public function storeMutation($data)
    {
        return DB::table('inventory_mutations')->insert($data);
    }

    /**
     * Penyesuaian stok.
     */
    public function getAdjustments()
    {
        return DB::table('inventory_adjustments')
            ->join('produk_m', 'inventory_adjustments.id_produk', '=', 'produk_m.id')
            ->join('gudang_m', 'inventory_adjustments.id_gudang', '=', 'gudang_m.id')
            ->select(
                'inventory_adjustments.*',
                'produk_m.nama_produk',
                'gudang_m.nama_gudang'
            )
            ->get();
    }

    public function storeAdjustment($data)
    {
        return DB::table('inventory_adjustments')->insert($data);
    }
}
