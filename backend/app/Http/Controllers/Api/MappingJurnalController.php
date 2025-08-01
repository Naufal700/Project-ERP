<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MappingJurnal;
use App\Models\Coa;
use Illuminate\Http\Request;

class MappingJurnalController extends Controller
{
    public function index()
    {
        $mappings = MappingJurnal::with(['akunDebit', 'akunKredit'])->get();
        return response()->json($mappings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'modul' => 'required',
            'kode_transaksi' => 'required',
            'nama_transaksi' => 'required',
            'kode_akun_debit' => 'required|exists:chartofaccount_m,kode_akun',
            'kode_akun_kredit' => 'required|exists:chartofaccount_m,kode_akun',
        ]);

        $mapping = MappingJurnal::create($request->all());
        return response()->json($mapping, 201);
    }

    public function show($id)
    {
        $mapping = MappingJurnal::with(['akunDebit', 'akunKredit'])->findOrFail($id);
        return response()->json($mapping);
    }

    public function update(Request $request, $id)
    {
        $mapping = MappingJurnal::findOrFail($id);
        $mapping->update($request->all());
        return response()->json($mapping);
    }

    public function destroy($id)
    {
        MappingJurnal::destroy($id);
        return response()->json(null, 204);
    }

    /**
     * Ambil daftar Chart of Account (COA) untuk dropdown
     */
    public function getCOA()
    {
        $coa = Coa::where('is_header', false)
            ->where('is_aktif', true)
            ->select('kode_akun', 'nama_akun')
            ->orderBy('kode_akun')
            ->get();

        return response()->json($coa);
    }
}
