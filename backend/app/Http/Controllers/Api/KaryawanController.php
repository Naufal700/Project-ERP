<?php

namespace App\Http\Controllers\Api;

use App\Models\Karyawan;
use Illuminate\Http\Request;
use App\Exports\KaryawanTemplateExport;
use App\Imports\KaryawanImport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class KaryawanController extends Controller
{
    public function index()
    {
        $data = Karyawan::orderBy('nama_lengkap')->get();
        return response()->json(['status' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nip' => 'required|string|unique:karyawan_m,nip',
            'jenis_kelamin' => 'required',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required',
            'alamat' => 'required',
            'email' => 'nullable|email',
            'no_hp' => 'nullable|string',
            'jabatan' => 'required',
            'divisi' => 'required',
            'tanggal_masuk' => 'required|date',
            'is_aktif' => 'boolean',
        ]);

        $karyawan = Karyawan::create($data);
        return response()->json(['status' => true, 'message' => 'Data disimpan', 'data' => $karyawan]);
    }

    public function update(Request $request, $id)
    {
        $karyawan = Karyawan::findOrFail($id);
        $data = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nip' => "required|string|unique:karyawan_m,nip,$id",
            'jenis_kelamin' => 'required',
            'tanggal_lahir' => 'required|date',
            'tempat_lahir' => 'required',
            'alamat' => 'required',
            'email' => 'nullable|email',
            'no_hp' => 'nullable|string',
            'jabatan' => 'required',
            'divisi' => 'required',
            'tanggal_masuk' => 'required|date',
            'is_aktif' => 'boolean',
        ]);

        $karyawan->update($data);
        return response()->json(['status' => true, 'message' => 'Data diperbarui']);
    }

    public function destroy($id)
    {
        Karyawan::destroy($id);
        return response()->json(['status' => true, 'message' => 'Data dihapus']);
    }

    public function downloadTemplate()
    {
        return Excel::download(new KaryawanTemplateExport, 'template_karyawan.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:xlsx,csv']);
        Excel::import(new KaryawanImport, $request->file('file'));
        return response()->json(['status' => true, 'message' => 'Import berhasil']);
    }
}
