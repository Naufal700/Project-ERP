<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JurnalUmum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class JurnalUmumController extends Controller
{
    /**
     * Ambil semua jurnal dengan relasi details
     */
    public function index(Request $request)
    {
        $query = JurnalUmum::with(['details.coa', 'creator'])
            ->when($request->from_date, fn($q) => $q->whereDate('tanggal', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('tanggal', '<=', $request->to_date))
            ->when($request->search, fn($q) => $q->where('keterangan', 'like', '%' . $request->search . '%'))
            ->orderBy('tanggal', 'desc');

        $perPage = $request->get('per_page', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Simpan jurnal baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'details' => 'required|array|min:1',
            'details.*.kode_akun' => 'required|string|exists:chartofaccount_m,kode_akun',
            'details.*.jenis' => 'required|in:debit,kredit',
            'details.*.nominal' => 'required|numeric|min:1',
        ]);

        // Validasi balance debit & kredit
        $totalDebit = collect($request->details)->where('jenis', 'debit')->sum('nominal');
        $totalKredit = collect($request->details)->where('jenis', 'kredit')->sum('nominal');

        if ($totalDebit !== $totalKredit) {
            return response()->json([
                'success' => false,
                'message' => 'Total debit dan kredit tidak balance!',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $kodeJurnal = JurnalUmum::generateKodeJurnal();

            $jurnal = JurnalUmum::create([
                'kode_jurnal' => $kodeJurnal,
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan,
                'created_by' => Auth::id() ?? 1,
            ]);

            foreach ($request->details as $detail) {
                $jurnal->details()->create([
                    'kode_akun'  => $detail['kode_akun'],
                    'jenis'      => $detail['jenis'],
                    'nominal'    => $detail['nominal'],
                    'keterangan' => $detail['keterangan'] ?? 'Jurnal Manual', // Default jika kosong
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil disimpan',
                'data' => $jurnal->load('details.coa'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan jurnal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tampilkan detail jurnal tertentu
     */
    public function show($id)
    {
        $jurnal = JurnalUmum::with(['details.coa', 'creator'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $jurnal,
        ]);
    }

    /**
     * Update jurnal
     */
    public function update(Request $request, $id)
    {
        $jurnal = JurnalUmum::findOrFail($id);

        $request->validate([
            'tanggal' => 'required|date',
            'keterangan' => 'required|string',
            'details' => 'required|array|min:1',
            'details.*.kode_akun' => 'required|string|exists:chartofaccount_m,kode_akun',
            'details.*.jenis' => 'required|in:debit,kredit',
            'details.*.nominal' => 'required|numeric|min:1',
        ]);

        $totalDebit = collect($request->details)->where('jenis', 'debit')->sum('nominal');
        $totalKredit = collect($request->details)->where('jenis', 'kredit')->sum('nominal');

        if ($totalDebit !== $totalKredit) {
            return response()->json([
                'success' => false,
                'message' => 'Total debit dan kredit tidak balance!',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $jurnal->update([
                'tanggal' => $request->tanggal,
                'keterangan' => $request->keterangan,
            ]);

            $jurnal->details()->delete();

            foreach ($request->details as $detail) {
                $jurnal->details()->create([
                    'kode_akun'  => $detail['kode_akun'],
                    'jenis'      => $detail['jenis'],
                    'nominal'    => $detail['nominal'],
                    'keterangan' => $detail['keterangan'] ?? 'Jurnal Manual', // Default jika kosong
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil diupdate',
                'data' => $jurnal->load('details.coa'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal update jurnal',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hapus jurnal
     */
    public function destroy($id)
    {
        $jurnal = JurnalUmum::withTrashed()->findOrFail($id);

        // Jika jurnal punya reference ke transaksi lain, misalnya DO
        if (!empty($jurnal->reference) && str_starts_with($jurnal->reference, 'DO-')) {
            return response()->json([
                'success' => false,
                'message' => 'Jurnal ini terkait dengan Delivery Order. Batalkan DO terlebih dahulu sebelum menghapus jurnal.'
            ], 400);
        }

        // Hapus detail jurnal dulu
        \App\Models\JurnalUmumDetail::where('jurnal_id', $jurnal->id)->forceDelete();

        // Hapus jurnal utama
        $jurnal->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Jurnal berhasil dihapus permanen',
        ]);
    }



    public function forceDestroy($id)
    {
        $jurnal = JurnalUmum::withTrashed()->findOrFail($id);

        // forceDelete akan menghapus permanen jurnal & detail
        $jurnal->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Jurnal dan detailnya berhasil dihapus permanen',
        ]);
    }
}
