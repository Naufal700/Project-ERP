<?php

namespace App\Http\Controllers\Api;

use App\Models\Coa;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CoaController extends Controller
{
    // Tampilkan semua data COA
    public function index()
    {
        $coa = Coa::orderBy('kode_akun')->get();
        return response()->json($coa);
    }

    // Tampilkan 1 data COA berdasarkan ID
    public function show($id)
    {
        $coa = Coa::findOrFail($id);
        return response()->json($coa);
    }

    // Simpan COA baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_akun' => 'required|unique:chartofaccount_m,kode_akun',
            'nama_akun' => 'required',
            'level_akun' => 'required|integer|min:1|max:4',
            'parent_kode_akun' => 'nullable|string',
            'kategori_akun' => 'nullable|string',
            'tipe_akun' => 'nullable|string',
            'kategori_laporan' => 'nullable|string',
            'saldo_normal' => 'nullable|in:debit,kredit',
            'saldo_awal' => 'nullable|numeric',
            'is_header' => 'boolean',
            'is_aktif' => 'boolean',
            'keterangan' => 'nullable|string',
        ]);

        $coa = Coa::create($validated);
        return response()->json($coa, 201);
    }

    // Update data COA
    public function update(Request $request, $id)
    {
        $coa = Coa::findOrFail($id);

        $validated = $request->validate([
            'kode_akun' => 'required|unique:chartofaccount_m,kode_akun,' . $id,
            'nama_akun' => 'required',
            'level_akun' => 'required|integer|min:1|max:4',
            'parent_kode_akun' => 'nullable|string',
            'kategori_akun' => 'nullable|string',
            'tipe_akun' => 'nullable|string',
            'kategori_laporan' => 'nullable|string',
            'saldo_normal' => 'nullable|in:debit,kredit',
            'saldo_awal' => 'nullable|numeric',
            'is_header' => 'boolean',
            'is_aktif' => 'boolean',
            'keterangan' => 'nullable|string',
        ]);

        $coa->update($validated);
        return response()->json($coa);
    }

    // Hapus data COA
    public function destroy($id)
    {
        $coa = Coa::findOrFail($id);
        $coa->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }
    // Ambil akun header (is_header = true) untuk dropdown parent
    public function listParents()
    {
        $parents = Coa::where('is_header', true)->orderBy('kode_akun')->get();
        return response()->json($parents);
    }
    public function search(Request $request)
    {
        $query = $request->query('q');

        $results = Coa::where('kode_akun', 'ILIKE', "%$query%")
            ->orWhere('nama_akun', 'ILIKE', "%$query%")
            ->orderBy('kode_akun')
            ->get();

        return response()->json($results);
    }
    public function toggleAktif($id)
    {
        $coa = Coa::findOrFail($id);
        $coa->is_aktif = !$coa->is_aktif;
        $coa->save();

        return response()->json(['message' => 'Status akun diperbarui', 'is_aktif' => $coa->is_aktif]);
    }
}
