<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesInvoice;
use App\Models\SalesPiutang;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class SalesPiutangController extends Controller
{
    // List semua piutang, bisa filter berdasarkan sales_invoice_id
    public function index(Request $request)
    {
        $query = SalesPiutang::with(['salesInvoice' => function ($q) {
            $q->whereIn('status', ['approved', 'collecting'])
                ->where('jenis_pembayaran', 'piutang')
                ->with('pelanggan');
        }]);

        if ($request->has('sales_invoice_id')) {
            $query->where('sales_invoice_id', $request->sales_invoice_id);
        }

        $query->whereIn('status', ['belum lunas', 'collecting']);

        $query->whereHas('salesInvoice', function ($q) {
            $q->whereIn('status', ['approved', 'collecting'])
                ->where('jenis_pembayaran', 'piutang');
        });

        $piutangs = $query->orderBy('tanggal_jatuh_tempo', 'asc')->get();

        return response()->json($piutangs);
    }


    // Simpan piutang baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sales_invoice_id' => 'required|exists:sales_invoice,id',
            'tanggal_jatuh_tempo' => 'required|date',
            'jumlah_piutang' => 'required|numeric|min:0',
            'jumlah_terbayar' => 'nullable|numeric|min:0',
            'status' => ['nullable', Rule::in(['belum lunas', 'lunas'])],
            'keterangan' => 'nullable|string',
        ]);

        $piutang = SalesPiutang::create($validated);

        return response()->json($piutang, 201);
    }

    // Detail piutang by id
    public function show($id)
    {
        $piutang = SalesPiutang::with('salesInvoice')->findOrFail($id);

        return response()->json($piutang);
    }

    // Update piutang
    public function update(Request $request, $id)
    {
        $piutang = SalesPiutang::findOrFail($id);

        $validated = $request->validate([
            'tanggal_jatuh_tempo' => 'sometimes|required|date',
            'jumlah_piutang' => 'sometimes|required|numeric|min:0',
            'jumlah_terbayar' => 'sometimes|numeric|min:0',
            'status' => ['sometimes', Rule::in(['belum lunas', 'lunas', 'piutang'])], // tambah 'collecting' jika perlu
            'keterangan' => 'nullable|string',
        ]);

        $piutang->update($validated);

        return response()->json($piutang);
    }

    // Hapus piutang
    public function destroy($id)
    {
        $piutang = SalesPiutang::findOrFail($id);
        $piutang->delete();

        return response()->json(['message' => 'Data piutang berhasil dihapus']);
    }

    // List invoice piutang (relasi piutang)
    public function listInvoicePiutang(Request $request)
    {
        $status = $request->query('status');

        $query = SalesInvoice::where('jenis_pembayaran', 'piutang');

        if ($status) {
            if (is_array($status)) {
                $query->whereIn('status', $status);
            } else {
                $query->where('status', $status);
            }
        }

        $invoices = $query->with(['salesPiutang', 'pelanggan'])->get();

        return response()->json($invoices);
    }


    // Approve invoice piutang, update status jadi 'collecting'
    public function approveInvoicePiutang($id)
    {
        $invoice = SalesInvoice::findOrFail($id);

        if ($invoice->jenis_pembayaran !== 'piutang') {
            return response()->json(['message' => 'Invoice bukan jenis piutang'], 400);
        }

        // Simpan status invoice, kalau mau ubah status invoice ke 'collecting' juga bisa disesuaikan
        $invoice->status = 'collecting';
        $invoice->save();

        $existingPiutang = SalesPiutang::where('sales_invoice_id', $invoice->id)->first();
        if (!$existingPiutang) {
            SalesPiutang::create([
                'sales_invoice_id'    => $invoice->id,
                'tanggal_jatuh_tempo' => $invoice->tanggal_jatuh_tempo,
                'jumlah_piutang'      => $invoice->total,
                'jumlah_terbayar'     => 0,
                'status'              => 'collecting',  // diubah jadi collecting
                'keterangan'          => 'Auto-generated saat approve invoice',
            ]);
        }

        return response()->json(['message' => 'Invoice piutang berhasil di-approve dan piutang dibuat', 'invoice' => $invoice]);
    }




    // Fungsi batch collecting untuk sales_piutang, generate nomor_collecting otomatis
    public function collecting(Request $request)
    {
        $validated = $request->validate([
            'piutang_ids' => 'required|array',
            'piutang_ids.*' => 'exists:sales_piutang,id',
        ]);

        foreach ($validated['piutang_ids'] as $id) {
            $piutang = SalesPiutang::findOrFail($id);

            if (!$piutang->nomor_collecting) {
                $piutang->nomor_collecting = $this->generateNomorCollecting();
            }

            // Update status jadi collecting
            $piutang->status = 'piutang';

            $piutang->save();
        }

        return response()->json([
            'message' => 'Collecting berhasil',
            'piutang_ids' => $validated['piutang_ids'],
        ]);
    }

    // Generate nomor_collecting unik dengan format COL-YYYYMMDDNNN
    private function generateNomorCollecting(): string
    {
        $prefix = 'COL-';
        $date = date('Ymd');
        $last = SalesPiutang::where('nomor_collecting', 'like', $prefix . $date . '%')
            ->orderBy('nomor_collecting', 'desc')
            ->first();

        if (!$last) {
            return $prefix . $date . '001';
        }

        $lastNumber = (int)substr($last->nomor_collecting, strlen($prefix . $date));
        $newNumber = $lastNumber + 1;

        return $prefix . $date . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
    }
    public function cancel($id)
    {
        $piutang = SalesPiutang::findOrFail($id);

        // Logika pembatalan piutang, misalnya update status jadi batal
        $piutang->status = 'batal';
        $piutang->save();

        // Kalau ingin juga update status invoice terkait, bisa ditambahkan di sini

        return response()->json(['message' => 'Piutang berhasil dibatalkan']);
    }
    public function verifyBatch(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:sales_invoice,id',
        ]);

        foreach ($validated['ids'] as $id) {
            $invoice = SalesInvoice::find($id);
            if ($invoice && $invoice->jenis_pembayaran === 'piutang') {
                $invoice->status = 'collecting';
                $invoice->save();

                // Cek apakah piutang sudah ada, kalau belum buat baru
                $existingPiutang = SalesPiutang::where('sales_invoice_id', $invoice->id)->first();
                if (!$existingPiutang) {
                    SalesPiutang::create([
                        'sales_invoice_id'    => $invoice->id,
                        'tanggal_jatuh_tempo' => $invoice->tanggal_jatuh_tempo,
                        'jumlah_piutang'      => $invoice->total,
                        'jumlah_terbayar'     => 0,
                        'status'              => 'collecting',
                        'keterangan'          => 'Auto-generated saat batch verify',
                    ]);
                } else {
                    // Kalau sudah ada piutang, update status jadi collecting juga
                    $existingPiutang->status = 'collecting';
                    $existingPiutang->save();
                }
            }
        }

        return response()->json(['message' => 'Batch verify berhasil dan status diubah ke collecting']);
    }
}
