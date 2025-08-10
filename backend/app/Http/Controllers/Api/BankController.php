<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bank;

class BankController extends Controller
{
    public function index()
    {
        $banks = Bank::with('akun')->get();

        $banks = $banks->map(function ($bank) {
            return [
                'id' => $bank->id,
                'nama_bank' => $bank->nama_bank,
                'no_rekening' => $bank->no_rekening,
                'nama_pemilik' => $bank->nama_pemilik,
                'kode_akun' => $bank->akun->kode_akun ?? null,
                'nama_akun' => $bank->akun->nama_akun ?? null,
            ];
        });

        return response()->json($banks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_bank' => 'required|string',
            'no_rekening' => 'nullable|string',
            'nama_pemilik' => 'nullable|string',
            'kode_akun' => 'required|exists:chartofaccount_m,kode_akun',
        ]);

        $bank = Bank::create($request->all());
        return response()->json($bank, 201);
    }

    public function show($id)
    {
        $bank = Bank::with('akun')->findOrFail($id);
        return response()->json($bank);
    }

    public function update(Request $request, $id)
    {
        $bank = Bank::findOrFail($id);

        $request->validate([
            'nama_bank' => 'required|string',
            'no_rekening' => 'nullable|string',
            'nama_pemilik' => 'nullable|string',
            'kode_akun' => 'required|exists:chartofaccount_m,kode_akun',
        ]);

        $bank->update($request->all());
        return response()->json($bank);
    }

    public function destroy($id)
    {
        $bank = Bank::findOrFail($id);
        $bank->delete();

        return response()->json(['message' => 'Bank deleted']);
    }
}
