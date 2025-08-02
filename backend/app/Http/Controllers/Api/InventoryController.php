<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected $inventory;

    public function __construct()
    {
        $this->inventory = new Inventory();
    }

    /**
     * Ambil setting metode persediaan.
     */
    public function getSetting()
    {
        return response()->json($this->inventory->getSetting());
    }

    /**
     * Update setting metode persediaan.
     */
    public function updateSetting(Request $request)
    {
        $request->validate([
            'metode' => 'required|in:fifo,average'
        ]);

        $this->inventory->updateSetting($request->metode);

        return response()->json(['message' => 'Pengaturan berhasil disimpan']);
    }

    /**
     * Ambil saldo awal persediaan.
     */
    public function getOpeningBalance()
    {
        $inventory = new Inventory();
        return response()->json($inventory->getOpeningBalance());
    }


    /**
     * Simpan saldo awal persediaan.
     */
    public function storeOpeningBalance(Request $request)
    {
        $request->validate([
            'id_produk' => 'required|exists:produk_m,id',
            'id_gudang' => 'required|exists:gudang_m,id',
            'qty'       => 'required|numeric|min:1',
            'harga'     => 'required|numeric|min:0'
        ]);

        $this->inventory->storeOpeningBalance($request->all());

        return response()->json(['message' => 'Saldo awal berhasil disimpan']);
    }

    /**
     * Ambil data mutasi gudang.
     */
    public function getMutations()
    {
        return response()->json($this->inventory->getMutations());
    }

    /**
     * Simpan mutasi gudang.
     */
    public function storeMutation(Request $request)
    {
        $request->validate([
            'id_produk'       => 'required|exists:produk_m,id',
            'id_gudang_asal'  => 'nullable|exists:gudang_m,id',
            'id_gudang_tujuan' => 'nullable|exists:gudang_m,id',
            'qty'             => 'required|numeric|min:1',
            'keterangan'      => 'nullable|string'
        ]);

        $this->inventory->storeMutation($request->all());

        return response()->json(['message' => 'Mutasi gudang berhasil disimpan']);
    }

    /**
     * Ambil data penyesuaian stok.
     */
    public function getAdjustments()
    {
        return response()->json($this->inventory->getAdjustments());
    }

    /**
     * Simpan penyesuaian stok.
     */
    public function storeAdjustment(Request $request)
    {
        $request->validate([
            'id_produk'  => 'required|exists:produk_m,id',
            'id_gudang'  => 'required|exists:gudang_m,id',
            'qty'        => 'required|numeric',
            'keterangan' => 'nullable|string'
        ]);

        $this->inventory->storeAdjustment($request->all());

        return response()->json(['message' => 'Penyesuaian stok berhasil disimpan']);
    }
}
