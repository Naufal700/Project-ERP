<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceDetail;
use App\Models\DeliveryOrder;
use App\Models\JurnalUmum;
use App\Models\JurnalUmumDetail;
use App\Models\MappingJurnal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            $diskon = $invoice->details->sum('diskon'); // ambil langsung dari detail
            $ppn    = $invoice->details->sum('ppn');    // ambil langsung dari detail
            $netto  = $bruto - $diskon + $ppn;

            $invoice->bruto  = $bruto;
            $invoice->diskon = $diskon;
            $invoice->ppn    = $ppn;
            $invoice->total  = $netto;

            return $invoice;
        });

        return $invoices;
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
        ]);

        if (SalesInvoice::where('id_do', $request->id_do)->exists()) {
            return response()->json(['message' => 'Faktur untuk DO ini sudah ada'], 400);
        }

        DB::transaction(function () use ($request) {
            $do = DeliveryOrder::with(['items.salesOrderDetail', 'salesOrder.details'])->findOrFail($request->id_do);

            $invoice = SalesInvoice::create([
                'nomor_invoice' => $this->generateNoInvoice(),
                'tanggal'       => now(),
                'id_pelanggan'  => $do->pelanggan_id,
                'id_do'         => $do->id,
                'status'        => 'draft',
                'total'         => 0,
                'diskon'        => 0,
                'ppn'           => 0,
            ]);

            $totalBruto = 0;
            $totalDiskon = 0;
            $totalPpn = 0;

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
    }

    public function approve($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['details', 'deliveryOrder.salesOrder.details', 'pelanggan'])->findOrFail($id);

            if ($invoice->status !== 'draft') {
                abort(400, 'Hanya faktur dengan status draft yang dapat di-approve');
            }

            $mapping = MappingJurnal::where('modul', 'sales/invoice')
                ->where('kode_transaksi', 'SI')
                ->first();

            if (!$mapping) {
                abort(400, 'Mapping jurnal untuk sales invoice belum diatur');
            }

            $bruto  = $invoice->details->sum(fn($d) => $d->qty * $d->harga);
            $diskon = $invoice->details->sum('diskon'); // dari tabel detail
            $ppn    = $invoice->details->sum('ppn');    // dari tabel detail
            $netto  = $bruto - $diskon + $ppn;

            $invoice->update([
                'diskon' => $diskon,
                'ppn'    => $ppn,
                'total'  => $netto
            ]);

            $keterangan = $invoice->nomor_invoice . ' - ' . $invoice->pelanggan->nama_pelanggan;
            $tanggal = now()->toDateString();

            // 1. Jurnal Penjualan
            $jurnalPenjualan = JurnalUmum::firstOrCreate(
                [
                    'tanggal'    => $tanggal,
                    'reference'  => 'SALES-' . date('Ymd'),
                ],
                [
                    'kode_jurnal' => $this->generateKodeJurnal('JU-SALES'),
                    'keterangan'  => 'Jurnal Penjualan Tanggal ' . date('d-m-Y'),
                    'created_by'  => auth()->id(),
                ]
            );

            // Piutang (debit) = Netto
            JurnalUmumDetail::create([
                'jurnal_id'  => $jurnalPenjualan->id,
                'kode_akun'  => $mapping->kode_akun_debit,
                'keterangan' => '(Pendapatan) ' . $keterangan,
                'jenis'      => 'debit',
                'nominal'    => $bruto,
            ]);

            // Pendapatan (kredit) = Bruto
            JurnalUmumDetail::create([
                'jurnal_id'  => $jurnalPenjualan->id,
                'kode_akun'  => $mapping->kode_akun_kredit,
                'keterangan' => '(Pendapatan) ' . $keterangan,
                'jenis'      => 'kredit',
                'nominal'    => $bruto,
            ]);

            // 2. Jurnal Diskon (jika ada)
            if ($diskon > 0) {
                $akunDiskon = MappingJurnal::where('modul', 'sales/invoice')
                    ->where('kode_transaksi', 'DISKON')
                    ->value('kode_akun_debit');

                if ($akunDiskon) {
                    $jurnalDiskon = JurnalUmum::firstOrCreate(
                        [
                            'tanggal'   => $tanggal,
                            'reference' => 'DISKON-' . date('Ymd'),
                        ],
                        [
                            'kode_jurnal' => $this->generateKodeJurnal('JU-DISKON'),
                            'keterangan'  => 'Jurnal Diskon Penj. Tanggal ' . date('d-m-Y'),
                            'created_by'  => auth()->id(),
                        ]
                    );

                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnalDiskon->id,
                        'kode_akun'  => $akunDiskon,
                        'keterangan' => '(Diskon Penjualan) ' . $keterangan,
                        'jenis'      => 'debit',
                        'nominal'    => $diskon,
                    ]);

                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnalDiskon->id,
                        'kode_akun'  => $mapping->kode_akun_debit,
                        'keterangan' => '(Diskon Penjualan) ' . $keterangan,
                        'jenis'      => 'kredit',
                        'nominal'    => $diskon,
                    ]);
                }
            }

            // 3. Jurnal PPN (jika ada)
            if ($ppn > 0) {
                $akunPpn = MappingJurnal::where('modul', 'sales/invoice')
                    ->where('kode_transaksi', 'PPN')
                    ->value('kode_akun_kredit');

                if ($akunPpn) {
                    $jurnalPpn = JurnalUmum::firstOrCreate(
                        [
                            'tanggal'   => $tanggal,
                            'reference' => 'PPN-' . date('Ymd'),
                        ],
                        [
                            'kode_jurnal' => $this->generateKodeJurnal('JU-PPN'),
                            'keterangan'  => 'Jurnal PPN Keluaran Tanggal ' . date('d-m-Y'),
                            'created_by'  => auth()->id(),
                        ]
                    );

                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnalPpn->id,
                        'kode_akun'  => $mapping->kode_akun_debit,
                        'keterangan' => '(PPN Keluaran) ' . $keterangan,
                        'jenis'      => 'debit',
                        'nominal'    => $ppn,
                    ]);

                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnalPpn->id,
                        'kode_akun'  => $akunPpn,
                        'keterangan' => '(PPN Keluaran) ' . $keterangan,
                        'jenis'      => 'kredit',
                        'nominal'    => $ppn,
                    ]);
                }
            }

            $invoice->update(['status' => 'approved']);
            $invoice->deliveryOrder->update(['status' => 'invoiced']);
        });

        return response()->json(['message' => 'Faktur berhasil di-approve, jurnal penjualan/diskon/PPN dibuat']);
    }

    public function rollback($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);

            if ($invoice->status !== 'approved') {
                abort(400, 'Hanya faktur yang sudah approved yang bisa di-rollback');
            }

            $jurnals = JurnalUmum::where('reference', $invoice->nomor_invoice)->get();
            foreach ($jurnals as $jurnal) {
                $jurnal->details()->delete();
                $jurnal->delete();
            }

            $invoice->update([
                'status' => 'draft',
                'diskon' => 0,
                'ppn'    => 0,
            ]);
            $invoice->deliveryOrder->update(['status' => 'approved']);
        });

        return response()->json(['message' => 'Faktur berhasil di-rollback ke draft']);
    }

    public function cancel($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);
            $tanggal = $invoice->created_at->format('Y-m-d');

            $jurnals = JurnalUmum::whereIn('reference', [
                'SALES-' . date('Ymd', strtotime($tanggal)),
                'DISKON-' . date('Ymd', strtotime($tanggal)),
                'PPN-' . date('Ymd', strtotime($tanggal)),
            ])->get();

            foreach ($jurnals as $jurnal) {
                // Hapus semua detail terkait nomor invoice
                $jurnal->details()
                    ->where('keterangan', 'like', '%' . $invoice->nomor_invoice . '%')
                    ->delete();

                // Reload details untuk cek apakah jurnal sudah kosong
                $jurnal->load('details');

                if ($jurnal->details->count() === 0) {
                    $jurnal->forceDelete(); // PAKAI forceDelete biar bener-bener hilang
                }
            }

            SalesInvoiceDetail::where('id_invoice', $invoice->id)->delete();
            $invoice->delete();
            $invoice->deliveryOrder->update(['status' => 'approved']);
        });

        return response()->json(['message' => 'Faktur berhasil dibatalkan']);
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
