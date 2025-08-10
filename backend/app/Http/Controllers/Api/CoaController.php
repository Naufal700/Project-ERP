<?php

namespace App\Http\Controllers\Api;

use App\Models\Coa;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Exports\CoaExport;
use App\Imports\CoaImport;
use Maatwebsite\Excel\Facades\Excel;

class CoaController extends Controller
{
    /**
     * Ambil semua akun COA (hanya akun aktif & detail).
     */
    public function index(Request $request)
    {
        $query = Coa::query();

        $query->where('is_aktif', true); // hanya akun aktif

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_akun', 'like', "%{$search}%")
                    ->orWhere('nama_akun', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('kode_akun')->get());
    }

    /**
     * Ambil detail COA berdasarkan ID.
     */
    public function show($id)
    {
        $coa = Coa::findOrFail($id);
        return response()->json($coa);
    }

    /**
     * Simpan COA baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_akun'         => 'required|unique:chartofaccount_m,kode_akun',
            'nama_akun'         => 'required',
            'level_akun'        => 'required|integer|min:1|max:4',
            'parent_kode_akun'  => 'nullable|string',
            'kategori_akun'     => 'nullable|string',
            'tipe_akun'         => 'nullable|string',
            'kategori_laporan'  => 'nullable|string',
            'saldo_normal'      => 'required|in:debit,kredit',
            'saldo_awal'        => 'nullable|numeric',
            'is_header'         => 'boolean',
            'is_aktif'          => 'boolean',
            'keterangan'        => 'nullable|string',
        ]);

        $coa = Coa::create($validated);
        return response()->json($coa, 201);
    }

    /**
     * Update COA.
     */
    public function update(Request $request, $id)
    {
        $coa = Coa::findOrFail($id);

        $validated = $request->validate([
            'kode_akun'         => 'required|unique:chartofaccount_m,kode_akun,' . $id,
            'nama_akun'         => 'required',
            'level_akun'        => 'required|integer|min:1|max:4',
            'parent_kode_akun'  => 'nullable|string',
            'kategori_akun'     => 'nullable|string',
            'tipe_akun'         => 'nullable|string',
            'kategori_laporan'  => 'nullable|string',
            'saldo_normal'      => 'required|in:debit,kredit',
            'saldo_awal'        => 'nullable|numeric',
            'is_header'         => 'boolean',
            'is_aktif'          => 'boolean',
            'keterangan'        => 'nullable|string',
        ]);

        $coa->update($validated);
        return response()->json($coa);
    }

    /**
     * Hapus COA.
     */
    public function destroy($id)
    {
        $coa = Coa::findOrFail($id);
        $coa->delete();

        return response()->json(['message' => 'Akun berhasil dihapus']);
    }

    /**
     * Ambil akun parent (header).
     */
    public function listParents()
    {
        return response()->json(
            Coa::where('is_header', true)->orderBy('kode_akun')->get()
        );
    }

    /**
     * Pencarian akun COA.
     */
    public function search(Request $request)
    {
        $query = $request->query('q', '');

        return response()->json(
            Coa::where('kode_akun', 'like', "%$query%")
                ->orWhere('nama_akun', 'like', "%$query%")
                ->orderBy('kode_akun')
                ->get()
        );
    }

    /**
     * Toggle status aktif/non-aktif akun.
     */
    public function toggleAktif($id)
    {
        $coa = Coa::findOrFail($id);
        $coa->is_aktif = !$coa->is_aktif;
        $coa->save();

        return response()->json([
            'message' => 'Status akun diperbarui',
            'is_aktif' => $coa->is_aktif
        ]);
    }

    /**
     * Export COA ke Excel.
     */
    public function exportExcel()
    {
        return Excel::download(new CoaExport, 'chart_of_account.xlsx');
    }

    /**
     * Import COA dari Excel.
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        Excel::import(new CoaImport, $request->file('file'));

        return response()->json(['message' => 'Import COA berhasil']);
    }
    /**
     * Ambil hanya akun dengan tipe kas dan bank.
     */
    public function kasBankOnly()
    {
        $data = Coa::whereIn('tipe_akun', ['kas', 'bank'])->orderBy('kode_akun')->get();
        return response()->json($data);
    }
}
