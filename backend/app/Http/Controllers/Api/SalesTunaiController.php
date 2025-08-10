<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesTunai;
use App\Models\SalesInvoice;
use App\Models\JurnalUmum;
use App\Models\JurnalUmumDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalesTunaiController extends Controller
{
    public function index(Request $request)
    {
        $query = SalesTunai::with(['salesInvoice', 'bank', 'caraBayar'])
            ->whereHas('salesInvoice', function ($q) {
                $q->where('jenis_pembayaran', 'tunai')
                    ->whereIn('status', ['approved', 'lunas', 'belum lunas']);
            });

        if ($request->has('sales_invoice_id')) {
            $query->where('sales_invoice_id', $request->sales_invoice_id);
        }

        $salesTunaiList = $query->orderBy('tanggal_bayar', 'asc')->get();

        // Hitung total bayar per sales_invoice_id
        $totalBayar = SalesTunai::select('sales_invoice_id', DB::raw('SUM(jumlah_bayar) as total_bayar'))
            ->groupBy('sales_invoice_id')
            ->pluck('total_bayar', 'sales_invoice_id'); // key = sales_invoice_id

        // Tambahkan total_bayar ke masing-masing item hasil query
        $salesTunaiList->each(function ($item) use ($totalBayar) {
            $item->total_bayar = $totalBayar->get($item->sales_invoice_id) ?? 0;
        });

        return response()->json($salesTunaiList);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sales_invoice_id' => 'required|exists:sales_invoice,id',
            'tanggal_bayar'    => 'required|date',
            'jumlah_bayar'     => 'required|numeric|min:0.01',
            'bank_id'          => 'nullable|exists:bank_m,id',
            'cara_bayar_id'    => 'nullable|exists:cara_bayar_m,id',
            'keterangan'       => 'nullable|string',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $invoice = SalesInvoice::findOrFail($request->sales_invoice_id);

                if (strtolower($invoice->jenis_pembayaran) !== 'tunai') {
                    throw new \Exception('Hanya faktur tunai yang dapat dicatat di sini.');
                }

                if ($invoice->status !== 'approved') {
                    throw new \Exception('Hanya faktur berstatus approved yang dapat dicatat pembayarannya.');
                }

                // Kode pembayaran unik
                $kodePembayaran = 'PAY-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                // Simpan pembayaran
                $payment = SalesTunai::create([
                    'sales_invoice_id' => $invoice->id,
                    'kode_pembayaran'  => $kodePembayaran,
                    'tanggal_bayar'    => $request->tanggal_bayar,
                    'jumlah_bayar'     => $request->jumlah_bayar,
                    'bank_id'          => $request->bank_id,
                    'cara_bayar_id'    => $request->cara_bayar_id,
                    'keterangan'       => $request->keterangan,
                ]);

                // Buat / update jurnal harian
                $this->createOrUpdateJurnalHarian($payment, $invoice);

                // Update status invoice
                $totalBayar = SalesTunai::where('sales_invoice_id', $invoice->id)->sum('jumlah_bayar');
                if ($totalBayar >= $invoice->total) {
                    $invoice->update(['status' => 'lunas']);
                }
            });

            return response()->json(['message' => 'Pembayaran tunai berhasil dicatat.']);
        } catch (\Exception $e) {
            Log::error('Error pembayaran tunai: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function cancelPayment($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $payment = SalesTunai::findOrFail($id);
                $invoice = $payment->salesInvoice;

                $reference = 'PENERIMAAN-TUNAI-' . $payment->tanggal_bayar;

                // Hapus detail jurnal sesuai pembayaran ini
                $jurnal = JurnalUmum::where('reference', $reference)->first();
                if ($jurnal) {
                    $jurnal->details()
                        ->where('keterangan', 'like', '%faktur ' . $invoice->nomor_invoice . '%')
                        ->delete();

                    // Kalau tidak ada detail tersisa, hapus jurnalnya
                    if ($jurnal->details()->count() === 0) {
                        $jurnal->delete();
                    }
                }

                // Hapus pembayaran
                $payment->delete();

                // Update status invoice jika belum lunas
                $totalBayar = SalesTunai::where('sales_invoice_id', $invoice->id)->sum('jumlah_bayar');
                if ($totalBayar < $invoice->total) {
                    $invoice->update(['status' => 'approved']);
                }
            });

            return response()->json(['message' => 'Pembayaran berhasil dibatalkan.']);
        } catch (\Exception $e) {
            Log::error('Error cancel pembayaran: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    private function createOrUpdateJurnalHarian(SalesTunai $payment, SalesInvoice $invoice)
    {
        $mapping = \App\Models\MappingJurnal::where('modul', 'sales/cash')
            ->where('kode_transaksi', 'Sales-Cash')
            ->first();

        if (!$mapping) {
            throw new \Exception('Mapping jurnal belum disetup.');
        }

        $reference = 'PENERIMAAN-TUNAI-' . $payment->tanggal_bayar;

        // Cek jurnal harian
        $jurnal = JurnalUmum::where('reference', $reference)->first();
        if (!$jurnal) {
            $jurnal = JurnalUmum::create([
                'tanggal'     => $payment->tanggal_bayar,
                'reference'   => $reference,
                'kode_jurnal' => $this->generateKodeJurnal('JU-CASH'),
                'keterangan'  => 'Penerimaan Penjualan Tunai Tanggal ' . $payment->tanggal_bayar,
                'created_by'  => auth()->id() ?? 1,
            ]);
        }

        // Debit kas/bank
        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnal->id,
            'kode_akun'  => $mapping->kode_akun_debit,
            'keterangan' => 'Kas/Bank dari faktur ' . $invoice->nomor_invoice,
            'jenis'      => 'debit',
            'nominal'    => $payment->jumlah_bayar,
        ]);

        // Kredit pendapatan
        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnal->id,
            'kode_akun'  => $mapping->kode_akun_kredit,
            'keterangan' => 'Pendapatan dari faktur ' . $invoice->nomor_invoice,
            'jenis'      => 'kredit',
            'nominal'    => $payment->jumlah_bayar,
        ]);
    }

    private function generateKodeJurnal($prefix)
    {
        $counter = 1;
        do {
            $kode = $prefix . '-' . date('Ymd') . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);
            $exists = JurnalUmum::where('kode_jurnal', $kode)->exists();
            $counter++;
        } while ($exists);

        return $kode;
    }
}
