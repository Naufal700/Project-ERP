<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\KategoriProduk;
use Illuminate\Http\Request;

class KategoriProdukController extends Controller
{
    public function index()
    {
        return KategoriProduk::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:100',
        ]);

        // Generate kode otomatis (cth: KT001)
        $last = KategoriProduk::orderBy('id', 'desc')->first();
        $nextCode = 'KT' . str_pad(($last->id ?? 0) + 1, 3, '0', STR_PAD_LEFT);

        return KategoriProduk::create([
            'kode_kategori' => $nextCode,
            'nama_kategori' => $request->nama_kategori,
        ]);
    }

    public function update(Request $request, $id)
    {
        $kategori = KategoriProduk::findOrFail($id);
        $kategori->update($request->only(['nama_kategori']));
        return $kategori;
    }

    public function destroy($id)
    {
        $kategori = KategoriProduk::findOrFail($id);
        $kategori->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show($id)
    {
        return KategoriProduk::findOrFail($id);
    }
}
