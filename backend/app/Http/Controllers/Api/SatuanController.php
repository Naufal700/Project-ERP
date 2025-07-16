<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Satuan;
use Illuminate\Http\Request;

class SatuanController extends Controller
{
    public function index()
    {
        return Satuan::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_satuan' => 'required|unique:satuan_m',
            'nama_satuan' => 'required',
            'keterangan' => 'nullable',
        ]);

        $satuan = Satuan::create($validated);
        return response()->json($satuan, 201);
    }

    public function show($id)
    {
        return Satuan::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $satuan = Satuan::findOrFail($id);

        $validated = $request->validate([
            'kode_satuan' => 'required|unique:satuan_m,kode_satuan,' . $id,
            'nama_satuan' => 'required',
            'keterangan' => 'nullable',
        ]);

        $satuan->update($validated);
        return response()->json($satuan);
    }

    public function destroy($id)
    {
        Satuan::destroy($id);
        return response()->json(null, 204);
    }
}
