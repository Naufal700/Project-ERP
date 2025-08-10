<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceDetail;
use App\Models\DeliveryOrder;
use App\Models\JurnalUmum;
use App\Models\JurnalUmumDetail;
use App\Models\MappingJurnal;
use App\Models\SalesTunai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SalesInvoiceController extends Controller
{
    public function getAvailableDO()
    {
        return DeliveryOrder::with(['items.produk', 'pelanggan'])
            ->where('status', 'approved')
            ->whereDoesntHave('salesInvoice')
            ->get();
    }

    public function index()
    {
        $invoices = SalesInvoice::with([
            'details.produk',
            'details.salesOrderDetail',
            'deliveryOrder.items.produk',
            'pelanggan'
        ])
            ->orderBy('id', 'desc')
            ->get();

        $invoices->transform(function ($invoice) {
            $bruto  = $invoice->details->sum(fn($d) => $d->qty * $d->harga);
            $diskon = $invoice->details->sum('diskon');
            $ppn    = $invoice->details->sum('ppn');
            $netto  = $bruto - $diskon + $ppn;

            $invoice->bruto  = $bruto;
            $invoice->diskon = $diskon;
            $invoice->ppn    = $ppn;
            $invoice->total  = $netto;

            return $invoice;
        });

        return response()->json($invoices);
    }

    private function generateNoInvoice()
    {
        $last = SalesInvoice::orderBy('id', 'desc')->first();
        $next = $last ? ((int)substr($last->nomor_invoice, -4) + 1) : 1;
        return 'INV-' . date('Ymd') . '-' . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_do' => 'required|exists:delivery_orders,id',
            'jenis_pembayaran' => 'required|in:tunai,piutang',
            'termin' => 'required_if:jenis_pembayaran,piutang|nullable|integer|min:0'
        ]);

        try {
            DB::transaction(function () use ($request) {
                if (SalesInvoice::where('id_do', $request->id_do)->exists()) {
                    throw new \Exception('Faktur untuk DO ini sudah ada');
                }

                $do = DeliveryOrder::with(['items.salesOrderDetail', 'salesOrder.details'])->findOrFail($request->id_do);

                $invoice = SalesInvoice::create([
                    'nomor_invoice'    => $this->generateNoInvoice(),
                    'tanggal'          => now(),
                    'tanggal_jatuh_tempo' => ($request->jenis_pembayaran === 'piutang' && $request->termin)
                        ? now()->addDays($request->termin)->toDateString()
                        : null,
                    'id_pelanggan'     => $do->pelanggan_id,
                    'id_do'            => $do->id,
                    'jenis_pembayaran' => $request->jenis_pembayaran,
                    'termin'           => $request->termin,
                    'status'           => 'draft',
                    'total'            => 0,
                    'diskon'           => 0,
                    'ppn'              => 0,
                ]);

                $totalBruto = $totalDiskon = $totalPpn = 0;

                foreach ($do->items as $item) {
                    $salesOrderDetail = $item->salesOrderDetail;

                    $harga  = $item->harga;
                    $qty    = $item->qty;
                    $diskon = $salesOrderDetail->diskon ?? 0;
                    $ppn    = $salesOrderDetail->ppn ?? 0;

                    $subtotal = ($harga - $diskon) * $qty + ($ppn * $qty);

                    $totalBruto  += $harga * $qty;
                    $totalDiskon += $diskon * $qty;
                    $totalPpn    += $ppn * $qty;

                    SalesInvoiceDetail::create([
                        'id_invoice'            => $invoice->id,
                        'id_produk'             => $item->produk_id,
                        'id_sales_order_detail' => $salesOrderDetail?->id,
                        'qty'                   => $qty,
                        'harga'                 => $harga,
                        'diskon'                => $diskon,
                        'ppn'                   => $ppn,
                        'subtotal'              => $subtotal,
                    ]);
                }

                $invoice->update([
                    'diskon' => $totalDiskon,
                    'ppn'    => $totalPpn,
                    'total'  => $totalBruto - $totalDiskon + $totalPpn
                ]);
            });

            return response()->json(['message' => 'Faktur berhasil dibuat dengan status draft']);
        } catch (\Exception $e) {
            Log::error('Error creating invoice: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membuat faktur: ' . $e->getMessage()], 500);
        }
    }

    public function approve($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $invoice = SalesInvoice::with(['details', 'deliveryOrder.salesOrder.details', 'pelanggan'])
                    ->findOrFail($id);

                if ($invoice->status !== 'draft') {
                    throw new \Exception('Hanya faktur dengan status draft yang dapat di-approve');
                }

                $bruto  = $invoice->details->sum(fn($d) => $d->qty * $d->harga);
                $diskon = $invoice->details->sum('diskon');
                $ppn    = $invoice->details->sum('ppn');
                $netto  = $bruto - $diskon + $ppn;

                $invoice->update([
                    'diskon' => $diskon,
                    'ppn'    => $ppn,
                    'total'  => $netto,
                    'status' => 'approved'
                ]);

                $invoice->deliveryOrder->update(['status' => 'invoiced']);

                $tanggal     = now()->toDateString();
                $keterangan  = $invoice->nomor_invoice . ' - ' . $invoice->pelanggan->nama_pelanggan;

                if ($invoice->jenis_pembayaran === 'piutang') {
                    $this->processPiutang($invoice, $bruto, $diskon, $ppn, $netto, $tanggal, $keterangan);
                }
                // else {
                //     $this->processTunai($invoice, $bruto, $diskon, $ppn, $netto, $tanggal, $keterangan);
                // }
            });

            return response()->json(['message' => 'Faktur berhasil di-approve']);
        } catch (\Exception $e) {
            Log::error('Error approving invoice: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal approve faktur: ' . $e->getMessage()], 500);
        }
    }

    private function processPiutang($invoice, $bruto, $diskon, $ppn, $netto, $tanggal, $keterangan)
    {
        try {
            $mapping = MappingJurnal::where('modul', 'sales/ar')
                ->where('kode_transaksi', 'Sales-AR')
                ->firstOrFail();

            // Reference gabungan per hari, contoh: SALES_AR_20250810
            $reference = 'SALES_AR_' . str_replace('-', '', $tanggal);

            // Cari atau buat jurnal umum header per tanggal & reference
            $jurnalPenjualan = JurnalUmum::firstOrCreate(
                ['tanggal' => $tanggal, 'reference' => $reference],
                [
                    'kode_jurnal' => $this->generateKodeJurnal('JU-SALES'),
                    'keterangan'  => 'Penjualan Kredit Tanggal ' . date('d/m/Y', strtotime($tanggal)),
                    'created_by'  => auth()->id(),
                ]
            );

            // Loop tiap detail invoice buat detail jurnal ke jurnal umum tadi
            foreach ($invoice->details as $detail) {
                $itemBruto = $detail->qty * $detail->harga;

                $keteranganDetail = "{$invoice->nomor_invoice} - {$invoice->pelanggan->nama_pelanggan} - {$detail->produk->nama_produk}";

                // Debit piutang per item (detail jurnal)
                JurnalUmumDetail::create([
                    'jurnal_id'  => $jurnalPenjualan->id,
                    'kode_akun'  => $mapping->kode_akun_debit,
                    'keterangan' => $keteranganDetail,
                    'jenis'      => 'debit',
                    'nominal'    => $itemBruto,
                ]);

                // Kredit pendapatan per item (detail jurnal)
                JurnalUmumDetail::create([
                    'jurnal_id'  => $jurnalPenjualan->id,
                    'kode_akun'  => $mapping->kode_akun_kredit,
                    'keterangan' => $keteranganDetail,
                    'jenis'      => 'kredit',
                    'nominal'    => $itemBruto,
                ]);
            }

            // Proses diskon (jurnal diskon juga satu per tanggal)
            if ($diskon > 0) {
                $this->processDiskonReceivable($invoice, $diskon, $tanggal, $keterangan, 'Disc-AR', $jurnalPenjualan->id);
            }

            // Proses PPN (jurnal PPN juga satu per tanggal)
            if ($ppn > 0) {
                $this->processPpnReceivable($invoice, $ppn, $tanggal, $keterangan, 'PPN-AR', $jurnalPenjualan->id);
            }

            // Simpan jurnal_id ke invoice (boleh simpan jurnal utama per tanggal ini)
            $invoice->update(['jurnal_id' => $jurnalPenjualan->id]);

            return $jurnalPenjualan;
        } catch (\Exception $e) {
            Log::error('Failed to process piutang for invoice ' . $invoice->nomor_invoice . ': ' . $e->getMessage());
            throw new \Exception('Gagal memproses jurnal piutang: ' . $e->getMessage());
        }
    }

    // private function processTunai($invoice, $bruto, $diskon, $ppn, $netto, $tanggal, $keterangan)
    // {
    //     // $mappingKas = MappingJurnal::where('modul', 'sales/cash')
    //     //     ->where('kode_transaksi', 'Sales-Cash')
    //     //     ->firstOrFail();

    //     // // Jurnal Tunai
    //     // $jurnalTunai = JurnalUmum::create([
    //     //     'tanggal'      => $tanggal,
    //     //     'reference'    => $invoice->nomor_invoice,
    //     //     'kode_jurnal'  => $this->generateKodeJurnal('JU-CASH'),
    //     //     'keterangan'   => 'Penjualan Tunai',
    //     //     'created_by'   => auth()->id(),
    //     // ]);

    //     // // Kas/Bank (debit)
    //     // JurnalUmumDetail::create([
    //     //     'jurnal_id'  => $jurnalTunai->id,
    //     //     'kode_akun'  => $mappingKas->kode_akun_debit,
    //     //     'keterangan' => '(Kas/Bank) ' . $keterangan,
    //     //     'jenis'      => 'debit',
    //     //     'nominal'    => $bruto,
    //     // ]);

    //     // // Pendapatan (kredit)
    //     // JurnalUmumDetail::create([
    //     //     'jurnal_id'  => $jurnalTunai->id,
    //     //     'kode_akun'  => $mappingKas->kode_akun_kredit,
    //     //     'keterangan' => '(Pendapatan) ' . $keterangan,
    //     //     'jenis'      => 'kredit',
    //     //     'nominal'    => $bruto,
    //     // ]);

    //     // Jurnal Diskon (jika ada)
    //     if ($diskon > 0) {
    //         $this->processDiskonTunai($invoice, $diskon, $tanggal, $keterangan, 'Disc-cash');
    //     }

    //     // Jurnal PPN (jika ada)
    //     if ($ppn > 0) {
    //         $this->processPpnTunai($invoice, $ppn, $tanggal, $keterangan, 'PPN-cash');
    //     }

    //     // Record pembayaran tunai
    //     // SalesTunai::create([
    //     //     'sales_invoice_id' => $invoice->id,
    //     //     'tanggal_bayar'    => $invoice->tanggal_faktur,
    //     //     'jumlah_bayar'     => $invoice->total,
    //     //     'bank_id'          => $request->bank_id,
    //     //     'cara_bayar_id'    => $request->cara_bayar_id,
    //     //     'keterangan'       => $request->keterangan,
    //     // ]);
    // }

    private function processDiskonReceivable($invoice, $diskon, $tanggal, $keterangan, $kodeTransaksi)
    {
        // Format tanggal agar konsisten (yyyy-mm-dd)
        $tanggal = date('Y-m-d', strtotime($tanggal));
        $reference = 'SALES_DISKON_AR_' . str_replace('-', '', $tanggal);

        $mapping = MappingJurnal::where('modul', 'sales/disc-ar')
            ->where('kode_transaksi', $kodeTransaksi)
            ->firstOrFail();

        // Cari atau buat jurnal header gabungan per tanggal
        $jurnalDiskon = JurnalUmum::firstOrCreate(
            ['tanggal' => $tanggal, 'reference' => $reference],
            [
                'kode_jurnal' => $this->generateKodeJurnal('JU-DISKON'),
                'keterangan'  => 'Diskon Penjualan Piutang Tanggal ' . date('d/m/Y', strtotime($tanggal)),
                'created_by'  => auth()->id(),
            ]
        );

        // Simpan detail jurnal diskon per invoice
        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnalDiskon->id,
            'kode_akun'  => $mapping->kode_akun_debit,
            'keterangan' => 'Diskon Penjualan ' . $invoice->nomor_invoice . $invoice->nama_pelanggan,
            'jenis'      => 'debit',
            'nominal'    => $diskon,
        ]);

        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnalDiskon->id,
            'kode_akun'  => $mapping->kode_akun_kredit,
            'keterangan' => 'Diskon Penjualan ' . $invoice->nomor_invoice . $invoice->nama_pelanggan,
            'jenis'      => 'kredit',
            'nominal'    => $diskon,
        ]);
    }


    private function processPpnReceivable($invoice, $ppn, $tanggal, $keterangan, $kodeTransaksi)
    {
        $tanggal = date('Y-m-d', strtotime($tanggal));
        $reference = 'SALES_PPN_AR_' . str_replace('-', '', $tanggal);

        $mapping = MappingJurnal::where('modul', 'sales/ppn-ar')
            ->where('kode_transaksi', $kodeTransaksi)
            ->firstOrFail();

        // Cari atau buat jurnal PPN gabungan per tanggal
        $jurnalPpn = JurnalUmum::firstOrCreate(
            ['tanggal' => $tanggal, 'reference' => $reference],
            [
                'kode_jurnal' => $this->generateKodeJurnal('JU-PPN'),
                'keterangan'  => 'PPN Keluaran Penjualan Piutang Tanggal ' . date('d/m/Y', strtotime($tanggal)),
                'created_by'  => auth()->id(),
            ]
        );

        // Detail debit: Piutang (akun debit)
        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnalPpn->id,
            'kode_akun'  => $mapping->kode_akun_debit,
            'keterangan' => 'PPN Keluaran ' . $invoice->nomor_invoice . $invoice->nama_pelanggan,
            'jenis'      => 'debit',
            'nominal'    => $ppn,
        ]);

        // Detail kredit: PPN Keluaran (akun kredit)
        JurnalUmumDetail::create([
            'jurnal_id'  => $jurnalPpn->id,
            'kode_akun'  => $mapping->kode_akun_kredit,
            'keterangan' => 'PPN Keluaran ' . $invoice->nomor_invoice . $invoice->nama_pelanggan,
            'jenis'      => 'kredit',
            'nominal'    => $ppn,
        ]);
    }

    // private function processDiskonTunai($invoice, $diskon, $tanggal, $keterangan, $kodeTransaksi)
    // {
    //     $mapping = MappingJurnal::where('modul', 'sales/disc-cash')
    //         ->where('kode_transaksi', $kodeTransaksi)
    //         ->firstOrFail();

    //     $jurnalDiskon = JurnalUmum::create([
    //         'tanggal'      => $tanggal,
    //         'reference'    => $invoice->nomor_invoice,
    //         'kode_jurnal' => $this->generateKodeJurnal('JU-DISKON'),
    //         'keterangan'   => 'Diskon Penj. Piutang Tanggal ' . now()->format('d/m/Y'),
    //         'created_by'   => auth()->id(),
    //     ]);

    //     // Debit: Akun Diskon Penjualan
    //     JurnalUmumDetail::create([
    //         'jurnal_id'  => $jurnalDiskon->id,
    //         'kode_akun'  => $mapping->kode_akun_debit,
    //         'keterangan' => '(Diskon Penjualan) ' . $keterangan,
    //         'jenis'      => 'debit',
    //         'nominal'    => $diskon,
    //     ]);

    //     // Kredit: Akun Piutang (untuk mengurangi piutang)
    //     JurnalUmumDetail::create([
    //         'jurnal_id'  => $jurnalDiskon->id,
    //         'kode_akun'  => $mapping->kode_akun_kredit,
    //         'keterangan' => '(Piutang - Diskon) ' . $keterangan,
    //         'jenis'      => 'kredit',
    //         'nominal'    => $diskon,
    //     ]);
    // }

    // private function processPpnTunai($invoice, $ppn, $tanggal, $keterangan, $kodeTransaksi)
    // {
    //     $mapping = MappingJurnal::where('modul', 'sales/ppn-cash')
    //         ->where('kode_transaksi', $kodeTransaksi)
    //         ->firstOrFail();

    //     $jurnalPpn = JurnalUmum::create([
    //         'tanggal'      => $tanggal,
    //         'reference'    => $invoice->nomor_invoice,
    //         'kode_jurnal' => $this->generateKodeJurnal('JU-PPN'),
    //         'keterangan'   => 'PPN Keluaran Penj. Piutang Tanggal ' . now()->format('d/m/Y'),
    //         'created_by'   => auth()->id(),
    //     ]);

    //     // Debit: Akun Piutang (untuk menambah piutang karena PPN)
    //     JurnalUmumDetail::create([
    //         'jurnal_id'  => $jurnalPpn->id,
    //         'kode_akun'  => $mapping->kode_akun_debit,
    //         'keterangan' => 'PPN Keluaran ' . $keterangan,
    //         'jenis'      => 'debit',
    //         'nominal'    => $ppn,
    //     ]);

    //     // Kredit: Akun PPN Keluaran
    //     JurnalUmumDetail::create([
    //         'jurnal_id'  => $jurnalPpn->id,
    //         'kode_akun'  => $mapping->kode_akun_kredit,
    //         'keterangan' => 'PPN Keluaran ' . $keterangan,
    //         'jenis'      => 'kredit',
    //         'nominal'    => $ppn,
    //     ]);
    // }

    public function rollback($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);

                if ($invoice->status !== 'approved') {
                    throw new \Exception('Hanya faktur yang sudah approved yang bisa di-rollback');
                }

                JurnalUmum::where('reference', $invoice->nomor_invoice)->get()->each(function ($jurnal) {
                    $jurnal->details()->delete();
                    $jurnal->delete();
                });

                if ($invoice->jenis_pembayaran === 'tunai') {
                    SalesTunai::where('sales_invoice_id', $invoice->id)->delete();
                }

                $invoice->update([
                    'status' => 'draft',
                    'diskon' => 0,
                    'ppn'    => 0,
                ]);

                $invoice->deliveryOrder->update(['status' => 'approved']);
            });

            return response()->json(['message' => 'Faktur berhasil di-rollback ke draft']);
        } catch (\Exception $e) {
            Log::error('Error rolling back invoice: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal rollback faktur: ' . $e->getMessage()], 500);
        }
    }

    public function cancel($id)
    {
        try {
            DB::transaction(function () use ($id) {
                $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);

                if ($invoice->jurnal_id) {
                    // Cari semua detail jurnal terkait invoice ini lewat keterangan yg ada nomor_invoice
                    $jurnalDetail = JurnalUmumDetail::where('jurnal_id', $invoice->jurnal_id)
                        ->where('keterangan', 'like', '%' . $invoice->nomor_invoice . '%')
                        ->get();

                    // Hapus semua detail jurnal tersebut
                    foreach ($jurnalDetail as $detail) {
                        $detail->delete();
                    }

                    // Cek apakah masih ada detail jurnal tersisa di jurnal umum header ini
                    $sisaDetail = JurnalUmumDetail::where('jurnal_id', $invoice->jurnal_id)->count();

                    // Kalau tidak ada detail tersisa, hapus jurnal umum headernya juga
                    if ($sisaDetail == 0) {
                        JurnalUmum::where('id', $invoice->jurnal_id)->delete();
                    }
                }

                // Hapus pembayaran tunai jika ada
                if ($invoice->jenis_pembayaran === 'tunai') {
                    SalesTunai::where('sales_invoice_id', $invoice->id)->delete();
                }

                // Hapus detail invoice
                SalesInvoiceDetail::where('id_invoice', $invoice->id)->delete();

                // Update status DO
                $invoice->deliveryOrder->update(['status' => 'approved']);

                // Hapus invoice
                $invoice->delete();
            });

            return response()->json(['message' => 'Faktur berhasil dibatalkan']);
        } catch (\Exception $e) {
            Log::error('Error canceling invoice: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membatalkan faktur: ' . $e->getMessage()], 500);
        }
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
    private function getMappingJurnal($modul, $kodeTransaksi)
    {
        $mapping = MappingJurnal::where('modul', $modul)
            ->where('kode_transaksi', $kodeTransaksi)
            ->first();

        if (!$mapping) {
            Log::error("Mapping jurnal tidak ditemukan untuk modul: $modul, kode: $kodeTransaksi");
            throw new \Exception("Konfigurasi akun untuk transaksi ini belum disetup. Silakan hubungi administrator.");
        }

        return $mapping;
    }
}
