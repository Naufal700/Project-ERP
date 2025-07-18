<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HargaJualProduk;
use Illuminate\Http\Request;

class HargaJualProdukController extends Controller
{
    public function index()
    {
        $data = HargaJualProduk::with('produk')->orderByDesc('tanggal_mulai')->get();
        return response()->json([
            'status' => true,
            'message' => 'Daftar harga jual',
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_produk' => 'required|exists:produk_m,id',
            'harga' => 'required|numeric',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        $hargaJual = HargaJualProduk::create([
            'id_produk' => $request->id_produk,
            'harga' => $request->harga,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_berakhir' => $request->tanggal_berakhir,
            'aktif' => true
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Harga jual berhasil ditambahkan',
            'data' => $hargaJual
        ]);
    }

    public function show($id)
    {
        $hargaJual = HargaJualProduk::with('produk')->findOrFail($id);

        return response()->json([
            'status' => true,
            'data' => $hargaJual
        ]);
    }

    public function update(Request $request, $id)
    {
        $hargaJual = HargaJualProduk::findOrFail($id);

        $request->validate([
            'id_produk' => 'required|exists:produk_m,id',
            'harga' => 'required|numeric',
            'tanggal_mulai' => 'required|date',
            'tanggal_berakhir' => 'nullable|date|after_or_equal:tanggal_mulai',
        ]);

        $hargaJual->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Harga jual berhasil diperbarui',
            'data' => $hargaJual
        ]);
    }

    public function destroy($id)
    {
        $hargaJual = HargaJualProduk::findOrFail($id);
        $hargaJual->delete();

        return response()->json([
            'status' => true,
            'message' => 'Harga jual berhasil dihapus'
        ]);
    }
}
