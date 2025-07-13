<?php

namespace App\Http\Controllers\Api;

use App\Models\Pelanggan;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exports\TemplatePelangganExport;
use App\Imports\PelangganImport;
use Maatwebsite\Excel\Facades\Excel;

class PelangganController extends Controller
{
    public function index()
    {
        return Pelanggan::all();
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'kode_pelanggan' => 'required|unique:pelanggan_m',
                'nama_pelanggan' => 'required',
            ]);

            return Pelanggan::create($request->all());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function show($id)
    {
        return Pelanggan::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $pelanggan = Pelanggan::findOrFail($id);

        // Validasi kode_pelanggan jika ada perubahan
        $request->validate([
            'kode_pelanggan' => 'required|unique:pelanggan_m,kode_pelanggan,' . $id,
            'nama_pelanggan' => 'required',
        ]);

        $pelanggan->update($request->all());
        return $pelanggan;
    }

    public function destroy($id)
    {
        Pelanggan::destroy($id);
        return response()->json(['message' => 'Data pelanggan berhasil dihapus']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new TemplatePelangganExport, 'template_pelanggan.xlsx');
    }
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        Excel::import(new PelangganImport, $request->file('file'));

        return response()->json(['message' => 'Import berhasil'], 200);
    }
}
