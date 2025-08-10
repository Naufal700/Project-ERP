<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MappingJurnal;
use App\Models\Coa;
use App\Models\CaraBayar;
use App\Models\Bank;
use Illuminate\Http\Request;

class MappingJurnalController extends Controller
{
    public function index()
    {
        $mappings = MappingJurnal::with(['akunDebit', 'akunKredit', 'caraBayar', 'bank'])->get();
        return response()->json($mappings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'modul' => 'required',
            'kode_transaksi' => 'required',
            'nama_transaksi' => 'required',
            'cara_bayar_id' => 'nullable|exists:cara_bayar_m,id',
            'bank_id' => 'nullable|exists:bank_m,id',
            'kode_akun_debit' => 'required|exists:chartofaccount_m,kode_akun',
            'kode_akun_kredit' => 'required|exists:chartofaccount_m,kode_akun',
        ]);

        $mapping = MappingJurnal::create($request->all());
        return response()->json($mapping->load(['akunDebit', 'akunKredit', 'caraBayar', 'bank']), 201);
    }

    public function show($id)
    {
        $mapping = MappingJurnal::with(['akunDebit', 'akunKredit', 'caraBayar', 'bank'])->findOrFail($id);
        return response()->json($mapping);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'modul' => 'required',
            'kode_transaksi' => 'required',
            'nama_transaksi' => 'required',
            'cara_bayar_id' => 'nullable|exists:cara_bayar_m,id',
            'bank_id' => 'nullable|exists:bank_m,id',
            'kode_akun_debit' => 'required|exists:chartofaccount_m,kode_akun',
            'kode_akun_kredit' => 'required|exists:chartofaccount_m,kode_akun',
        ]);

        $mapping = MappingJurnal::findOrFail($id);
        $mapping->update($request->all());
        return response()->json($mapping->load(['akunDebit', 'akunKredit', 'caraBayar', 'bank']));
    }

    public function destroy($id)
    {
        MappingJurnal::destroy($id);
        return response()->json(null, 204);
    }

    // Dropdown COA
    public function getCOA()
    {
        $coa = Coa::where('is_header', false)
            ->where('is_aktif', true)
            ->select('kode_akun', 'nama_akun')
            ->orderBy('kode_akun')
            ->get();

        return response()->json($coa);
    }

    // Dropdown Cara Bayar
    public function getCaraBayar()
    {
        return response()->json(CaraBayar::select('id', 'nama_cara_bayar', 'tipe', 'kode_akun')->get());
    }

    // Dropdown Bank
    public function getBank()
    {
        return response()->json(Bank::select('id', 'nama_bank', 'no_rekening', 'nama_pemilik', 'kode_akun')->get());
    }
}
