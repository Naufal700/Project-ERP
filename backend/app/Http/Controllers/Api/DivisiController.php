<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use Illuminate\Http\Request;

class DivisiController extends Controller
{
    public function index()
    {
        return response()->json(Divisi::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_divisi' => 'required|unique:divisi_m,kode_divisi',
            'nama_divisi' => 'required',
        ]);

        $data = Divisi::create($request->all());
        return response()->json($data, 201);
    }

    public function show($id)
    {
        return response()->json(Divisi::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $divisi = Divisi::findOrFail($id);
        $request->validate([
            'kode_divisi' => 'required|unique:divisi_m,kode_divisi,' . $id,
            'nama_divisi' => 'required',
        ]);
        $divisi->update($request->all());
        return response()->json($divisi);
    }

    public function destroy($id)
    {
        Divisi::destroy($id);
        return response()->json(['message' => 'Data berhasil dihapus']);
    }
}
