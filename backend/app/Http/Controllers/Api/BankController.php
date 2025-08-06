<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\CaraBayar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BankController extends Controller
{
    /**
     * Ambil semua bank beserta cara bayar.
     */
    public function index()
    {
        $banks = Bank::with('caraBayar')->get();
        return response()->json($banks);
    }

    /**
     * Simpan bank baru beserta cara bayar.
     */
    public function store(Request $request)
    {
        $request->validate([
            'kode_bank'      => 'required|string|unique:bank_m,kode_bank',
            'nama_bank'      => 'required|string',
            'no_rekening'    => 'nullable|string',
            'atas_nama'      => 'nullable|string',
            'cara_bayar_ids' => 'array'
        ]);

        DB::beginTransaction();
        try {
            $bank = Bank::create($request->only(['kode_bank', 'nama_bank', 'no_rekening', 'atas_nama']));

            if (!empty($request->cara_bayar_ids)) {
                $bank->caraBayar()->sync($request->cara_bayar_ids);
            }

            DB::commit();
            return response()->json([
                'message' => 'Bank berhasil ditambahkan',
                'data'    => $bank->load('caraBayar')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menambahkan bank', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update bank beserta cara bayar.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_bank'      => 'required|string',
            'no_rekening'    => 'nullable|string',
            'atas_nama'      => 'nullable|string',
            'cara_bayar_ids' => 'array'
        ]);

        DB::beginTransaction();
        try {
            $bank = Bank::findOrFail($id);
            $bank->update($request->only(['nama_bank', 'no_rekening', 'atas_nama']));

            if (isset($request->cara_bayar_ids)) {
                $bank->caraBayar()->sync($request->cara_bayar_ids);
            }

            DB::commit();
            return response()->json([
                'message' => 'Bank berhasil diperbarui',
                'data'    => $bank->load('caraBayar')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui bank', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Hapus bank.
     */
    public function destroy($id)
    {
        try {
            $bank = Bank::findOrFail($id);
            $bank->caraBayar()->detach();
            $bank->delete();

            return response()->json(['message' => 'Bank berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus bank', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ambil semua cara bayar (untuk dropdown)
     */
    public function getCaraBayar()
    {
        return response()->json(CaraBayar::all());
    }
}
