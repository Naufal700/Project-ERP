<?php

namespace App\Http\Controllers\Api;

use App\Models\Gudang;
use Illuminate\Http\Request;
use App\Exports\GudangExport;
use App\Imports\GudangImport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class GudangController extends Controller
{
    public function index()
    {
        return response()->json(Gudang::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_gudang' => 'required|string|max:100',
            'alamat' => 'required|string',
            'penanggung_jawab' => 'nullable|string|max:100',
        ]);

        $last = Gudang::orderBy('id', 'desc')->first();
        $nextNumber = $last ? ((int)substr($last->kode_gudang, 4)) + 1 : 1;
        $kode = 'GDG-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        $gudang = Gudang::create([
            'kode_gudang' => $kode,
            'nama_gudang' => $request->nama_gudang,
            'alamat' => $request->alamat,
            'penanggung_jawab' => $request->penanggung_jawab,
            'status' => 'aktif',
        ]);

        return response()->json($gudang);
    }

    public function show($id)
    {
        $gudang = Gudang::findOrFail($id);
        return response()->json($gudang);
    }

    public function update(Request $request, $id)
    {
        $gudang = Gudang::findOrFail($id);

        $validated = $request->validate([
            'kode_gudang' => 'required|unique:gudang_m,kode_gudang,' . $id,
            'nama_gudang' => 'required',
            'alamat' => 'required',
            'penanggung_jawab' => 'required',
            'status' => 'in:aktif,nonaktif',
        ]);

        $gudang->update($validated);
        return response()->json($gudang);
    }

    public function destroy($id)
    {
        $gudang = Gudang::findOrFail($id);
        $gudang->delete();

        return response()->json(['message' => 'Gudang berhasil dihapus.'], 200);
    }

    public function kodeOtomatis()
    {
        $last = Gudang::orderBy('id', 'desc')->first();
        $nextNumber = $last ? ((int)substr($last->kode_gudang, 4)) + 1 : 1;
        $kode = 'GDG-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return response()->json(['kode_gudang' => $kode]);
    }

    /** ✅ Download template excel */
    public function downloadTemplate()
    {
        return Excel::download(new GudangExport, 'template_gudang.xlsx');
    }

    /** ✅ Import data gudang dari excel */
    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,csv']);
        Excel::import(new GudangImport, $request->file('file'));
        return response()->json(['status' => true, 'message' => 'Import gudang berhasil']);
    }
}
