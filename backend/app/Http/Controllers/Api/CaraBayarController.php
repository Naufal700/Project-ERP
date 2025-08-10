<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CaraBayar;
use Illuminate\Http\Request;

class CaraBayarController extends Controller
{
    public function index()
    {
        $caraBayar = CaraBayar::with('akun')->get();

        $result = $caraBayar->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_cara_bayar' => $item->nama_cara_bayar,
                'tipe' => $item->tipe,
                'is_default' => $item->is_default,
                'kode_akun' => optional($item->akun)->kode_akun,
                'nama_akun' => optional($item->akun)->nama_akun,
            ];
        });

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_cara_bayar' => 'required|string|max:255',
            'tipe' => 'required|in:kas,bank',
            'kode_akun' => 'required|string|exists:chartofaccount_m,kode_akun',
            'is_default' => 'nullable|boolean',
        ]);

        $data = CaraBayar::create($request->all());
        return response()->json($data, 201);
    }

    public function show($id)
    {
        $data = CaraBayar::with('akun')->findOrFail($id);
        return response()->json($data);
    }

    public function update(Request $request, $id)
    {
        $data = CaraBayar::findOrFail($id);
        $request->validate([
            'nama_cara_bayar' => 'sometimes|required|string|max:255',
            'tipe' => 'sometimes|required|in:kas,bank',
            'kode_akun' => 'sometimes|required|string|exists:chartofaccount_m,kode_akun',
            'is_default' => 'nullable|boolean',
        ]);

        $data->update($request->all());
        return response()->json($data);
    }

    public function destroy($id)
    {
        $data = CaraBayar::findOrFail($id);
        $data->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
