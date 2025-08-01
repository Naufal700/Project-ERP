<?php

namespace App\Http\Controllers\Api;

use App\Models\Pelanggan;
use Illuminate\Http\Request;
use App\Exports\PelangganExport;
use App\Imports\PelangganImport;
use App\Http\Controllers\Controller;
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
                'email' => 'nullable|email',
                'telepon' => 'nullable|string|max:20',
                'alamat' => 'nullable|string',
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

        $request->validate([
            'kode_pelanggan' => 'required|unique:pelanggan_m,kode_pelanggan,' . $id,
            'nama_pelanggan' => 'required',
            'email' => 'nullable|email',
            'telepon' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
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
        return Excel::download(new PelangganExport, 'data_pelanggan.xlsx');
    }
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        try {
            Excel::import(new PelangganImport, $request->file('file'));
            return response()->json(['message' => 'Import berhasil'], 200);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            return response()->json(['errors' => $failures], 422);
        }
    }
}
