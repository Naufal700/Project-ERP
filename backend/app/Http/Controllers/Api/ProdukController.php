<?php

namespace App\Http\Controllers\Api;

use App\Models\Produk;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProdukExport;
use App\Exports\TemplateProdukExport;
use App\Imports\ProdukImport;

class ProdukController extends Controller
{
    // 📌 Ambil semua produk
    public function index()
    {
        $produk = Produk::with(['kategori', 'satuan'])->orderBy('kode_produk')->get();
        return response()->json($produk);
    }

    // 📌 Simpan produk baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_produk' => 'required|unique:produk_m',
            'nama_produk' => 'required',
            'id_kategori' => 'nullable|exists:kategori_produk,id',
            'id_satuan'   => 'nullable|exists:satuan_m,id',
            'harga_beli'  => 'required|numeric|min:0',
            'harga_jual'  => 'required|numeric|min:0',
            'is_aktif'    => 'boolean',
        ]);

        $produk = Produk::create($validated);
        return response()->json($produk, 201);
    }

    // 📌 Ambil detail produk
    public function show($id)
    {
        $produk = Produk::with(['kategori', 'satuan'])->findOrFail($id);
        return response()->json($produk);
    }

    // 📌 Update produk
    public function update(Request $request, $id)
    {
        $produk = Produk::findOrFail($id);

        $validated = $request->validate([
            'kode_produk' => 'required|unique:produk_m,kode_produk,' . $id,
            'nama_produk' => 'required',
            'id_kategori' => 'nullable|exists:kategori_produk,id',
            'id_satuan'   => 'nullable|exists:satuan_m,id',
            'harga_beli'  => 'required|numeric|min:0',
            'harga_jual'  => 'required|numeric|min:0',
            'is_aktif'    => 'boolean',
        ]);

        $produk->update($validated);
        return response()->json($produk);
    }

    // 📌 Hapus produk
    public function destroy($id)
    {
        $produk = Produk::findOrFail($id);
        $produk->delete();

        return response()->json(['message' => 'Produk berhasil dihapus']);
    }

    // 📥 Download template Excel
    public function downloadTemplate()
    {
        return Excel::download(new ProdukExport, 'template_produk.xlsx');
    }

    // 📥 Import Excel
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        try {
            Excel::import(new ProdukImport, $request->file('file'));
            return response()->json(['message' => '✅ Import produk berhasil']);
        } catch (\Exception $e) {
            return response()->json(['error' => '❌ Gagal import: ' . $e->getMessage()], 500);
        }
    }

    // 📤 Export Excel semua produk
    public function export()
    {
        return Excel::download(new ProdukExport, 'produk.xlsx');
    }

    // 🔢 Generate kode produk baru
    public function generateKode()
    {
        $lastKode = Produk::orderBy('id', 'desc')->value('kode_produk');
        $newKode = 'PRD-001';

        if ($lastKode && preg_match('/PRD-(\d+)/', $lastKode, $matches)) {
            $number = (int) $matches[1];
            $newKode = 'PRD-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
        }

        return response()->json(['kode' => $newKode]);
    }
}
