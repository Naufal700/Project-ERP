<?php

namespace App\Imports;

use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;
use App\Models\InventorySetting;

class InventorySaldoAwalImport implements ToCollection, WithHeadingRow
{
    protected $periode;

    public function __construct($periode)
    {
        $this->periode = $periode;
    }

    public function collection(Collection $rows)
    {
        $metode = InventorySetting::first()->metode ?? 'fifo';

        foreach ($rows as $row) {
            if (!isset($row['kode_produk']) || !isset($row['qty']) || !isset($row['harga'])) {
                continue;
            }

            // Ambil produk dan pastikan hanya yang inventory
            $produk = DB::table('produk_m')
                ->where('kode_produk', $row['kode_produk'])
                ->where('jenis_produk', 'persediaan') // ✅ filter hanya inventory
                ->first();

            if (!$produk) {
                // Lewati jika produk tidak ada atau bukan inventory
                continue;
            }

            $existing = DB::table('inventory_opening_balance')
                ->where('id_produk', $produk->id)
                ->where('id_gudang', 1)
                ->where('periode', $this->periode)
                ->first();

            if ($existing) {
                if ($metode === 'average') {
                    $totalQty = $existing->qty + $row['qty'];
                    $totalValue = ($existing->qty * $existing->harga) + ($row['qty'] * $row['harga']);
                    $newPrice = $totalQty > 0 ? $totalValue / $totalQty : $row['harga'];

                    DB::table('inventory_opening_balance')
                        ->where('id', $existing->id)
                        ->update([
                            'qty'        => $totalQty,
                            'harga'      => $newPrice,
                            'total'      => $totalQty * $newPrice,
                            'updated_at' => now(),
                        ]);
                } else {
                    $newQty = $existing->qty + $row['qty'];
                    DB::table('inventory_opening_balance')
                        ->where('id', $existing->id)
                        ->update([
                            'qty'        => $newQty,
                            'harga'      => $row['harga'],
                            'total'      => $newQty * $row['harga'],
                            'updated_at' => now(),
                        ]);
                }
            } else {
                DB::table('inventory_opening_balance')->insert([
                    'id_produk'  => $produk->id,
                    'id_gudang'  => 1,
                    'periode'    => $this->periode,
                    'qty'        => $row['qty'],
                    'harga'      => $row['harga'],
                    'total'      => $row['qty'] * $row['harga'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
