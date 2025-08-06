<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesPayment;
use App\Models\SalesInvoice;
use App\Models\JurnalUmum;
use App\Models\JurnalUmumDetail;
use App\Models\MappingJurnal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesPaymentController extends Controller
{
    public function index()
    {
        $payments = SalesPayment::with(['invoice.pelanggan'])->latest()->get();
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_invoice' => 'required|exists:sales_invoice,id',
            'tanggal_bayar' => 'required|date',
            'metode' => 'required|in:tunai,piutang',
            'jumlah_bayar' => 'required|numeric|min:0'
        ]);

        return DB::transaction(function () use ($request) {
            $invoice = SalesInvoice::with('pelanggan')->findOrFail($request->id_invoice);

            // Simpan pembayaran
            $payment = SalesPayment::create([
                'id_invoice' => $request->id_invoice,
                'tanggal_bayar' => $request->tanggal_bayar,
                'metode' => $request->metode,
                'jumlah_bayar' => $request->jumlah_bayar,
                'keterangan' => $request->keterangan ?? null,
            ]);

            // Jurnal otomatis
            $mapping = MappingJurnal::where('modul', 'pembayaran')
                ->where('kode_transaksi', $request->metode === 'tunai' ? 'PAY_CASH' : 'PAY_AR')
                ->firstOrFail();

            $kodeJurnal = 'JU-PAY-' . Carbon::now()->format('Ymd') . '-' . str_pad(JurnalUmum::count() + 1, 4, '0', STR_PAD_LEFT);

            $jurnal = JurnalUmum::create([
                'tanggal' => $request->tanggal_bayar,
                'kode_jurnal' => $kodeJurnal,
                'keterangan' => 'Pembayaran Invoice ' . $invoice->nomor_invoice,
                'reference' => $payment->id,
                'created_by' => auth()->id(),
            ]);

            // Debit & Kredit
            JurnalUmumDetail::create([
                'id_jurnal' => $jurnal->id,
                'kode_akun' => $mapping->kode_akun_debit,
                'debit' => $request->jumlah_bayar,
                'kredit' => 0,
                'keterangan' => 'Pembayaran Invoice ' . $invoice->nomor_invoice
            ]);

            JurnalUmumDetail::create([
                'id_jurnal' => $jurnal->id,
                'kode_akun' => $mapping->kode_akun_kredit,
                'debit' => 0,
                'kredit' => $request->jumlah_bayar,
                'keterangan' => 'Pembayaran Invoice ' . $invoice->nomor_invoice
            ]);

            // Update status invoice jika sudah lunas
            $totalBayar = SalesPayment::where('id_invoice', $invoice->id)->sum('jumlah_bayar');
            if ($totalBayar >= $invoice->total) {
                $invoice->update(['status' => 'paid']);
            }

            return response()->json($payment, 201);
        });
    }
}
