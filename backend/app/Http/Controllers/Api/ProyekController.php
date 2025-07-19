<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proyek;
use Illuminate\Http\Request;

class ProyekController extends Controller
{
    public function index()
    {
        return response()->json(Proyek::with('karyawan')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_proyek' => 'required|unique:proyek_m,kode_proyek',
            'nama_proyek' => 'required',
            'tipe_penanggung_jawab' => 'nullable|in:karyawan,opsional',
            'id_karyawan' => 'nullable|exists:karyawan_m,id',
            'nama_penanggung_jawab_opsional' => 'nullable|string',
        ]);

        $data = Proyek::create($request->all());
        return response()->json($data, 201);
    }

    public function show($id)
    {
        return response()->json(Proyek::with('karyawan')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $proyek = Proyek::findOrFail($id);
        $request->validate([
            'kode_proyek' => 'required|unique:proyek_m,kode_proyek,' . $id,
            'nama_proyek' => 'required',
            'tipe_penanggung_jawab' => 'nullable|in:karyawan,opsional',
            'id_karyawan' => 'nullable|exists:karyawan_m,id',
            'nama_penanggung_jawab_opsional' => 'nullable|string',
        ]);

        $proyek->update($request->all());
        return response()->json($proyek);
    }

    public function destroy($id)
    {
        Proyek::destroy($id);
        return response()->json(['message' => 'Data berhasil dihapus']);
    }
}
