<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pajak;
use Illuminate\Http\Request;

class PajakController extends Controller
{
    public function index(Request $request)
    {
        $query = Pajak::query();

        if ($request->has('search')) {
            $query->where('nama', 'ilike', "%{$request->search}%")
                ->orWhere('kode', 'ilike', "%{$request->search}%");
        }

        if ($request->has('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        if ($request->has('is_aktif')) {
            $query->where('is_aktif', $request->is_aktif);
        }

        return response()->json($query->orderBy('nama')->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|unique:pajak_m,kode',
            'nama' => 'required',
            'jenis' => 'required|in:ppn,pph,bea_masuk,pajak_daerah,non_pkp,bebas',
            'sub_jenis' => 'nullable|in:ppn_masukan,ppn_keluaran,pph21,pph22,pph23,pph_final,tanpa_pajak',
            'persen' => 'required|numeric|min:0|max:100',
            'inclusive' => 'boolean',
            'is_aktif' => 'boolean',
        ]);

        $pajak = Pajak::create($validated);
        return response()->json($pajak, 201);
    }

    public function show($id)
    {
        return response()->json(Pajak::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $pajak = Pajak::findOrFail($id);

        $validated = $request->validate([
            'kode' => 'required|unique:pajak_m,kode,' . $id,
            'nama' => 'required',
            'jenis' => 'required|in:ppn,pph,bea_masuk,pajak_daerah,non_pkp,bebas',
            'sub_jenis' => 'nullable|in:ppn_masukan,ppn_keluaran,pph21,pph22,pph23,pph_final,tanpa_pajak',
            'persen' => 'required|numeric|min:0|max:100',
            'inclusive' => 'boolean',
            'is_aktif' => 'boolean',
        ]);

        $pajak->update($validated);
        return response()->json($pajak);
    }

    public function destroy($id)
    {
        $pajak = Pajak::findOrFail($id);
        $pajak->delete();
        return response()->json(['message' => 'Pajak berhasil dihapus']);
    }
}
