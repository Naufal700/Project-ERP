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
        return SalesInvoice::with(['details.produk', 'deliveryOrder.items.produk', 'pelanggan'])
            ->orderBy('id', 'desc')
            ->get();
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
            $do = DeliveryOrder::with(['items'])->findOrFail($request->id_do);

            $invoice = SalesInvoice::create([
                'nomor_invoice' => $this->generateNoInvoice(),
                'tanggal'       => now(),
                'id_pelanggan'  => $do->pelanggan_id,
                'id_do'         => $do->id,
                'status'        => 'draft',
                'total'         => 0,
            ]);

            $total = 0;
            foreach ($do->items as $item) {
                $subtotal = $item->qty * $item->harga;
                $total += $subtotal;

                SalesInvoiceDetail::create([
                    'id_invoice' => $invoice->id,
                    'id_produk'  => $item->produk_id,
                    'qty'        => $item->qty,
                    'harga'      => $item->harga,
                    'subtotal'   => $subtotal,
                ]);
            }

            $invoice->update(['total' => $total]);
        });

        return response()->json(['message' => 'Faktur berhasil dibuat dengan status draft']);
    }

    public function approve($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['deliveryOrder', 'details.produk', 'pelanggan'])->findOrFail($id);

            if ($invoice->status !== 'draft') {
                abort(400, 'Hanya faktur dengan status draft yang dapat di-approve');
            }

            // Cek mapping jurnal
            $mapping = MappingJurnal::where('modul', 'sales/invoice')
                ->where('kode_transaksi', 'SI')
                ->first();

            if (!$mapping) {
                abort(400, 'Mapping jurnal untuk sales invoice belum diatur');
            }

            // Cari jurnal per hari
            $jurnal = JurnalUmum::whereDate('tanggal', now())
                ->where('kode_jurnal', 'like', 'JU-SI-' . date('Ymd') . '%')
                ->first();

            if (!$jurnal) {
                $jurnal = JurnalUmum::create([
                    'tanggal'     => now(),
                    'kode_jurnal' => $this->generateKodeJurnal(),
                    'keterangan'  => 'Penjualan tanggal ' . now()->format('d/m/Y'),
                    'reference'   => 'GROUPED-SI-' . now()->format('Ymd'),
                    'created_by'  => auth()->id(),

                ]);
            }

            // Tambah detail jurnal (debit & kredit)
            $keterangan = $invoice->nomor_invoice . ' - ' . $invoice->pelanggan->nama_pelanggan;

            JurnalUmumDetail::create([
                'jurnal_id'  => $jurnal->id,
                'kode_akun'  => $mapping->kode_akun_debit,
                'keterangan' => $keterangan,
                'jenis'      => 'debit',
                'nominal'    => $invoice->total,
            ]);

            JurnalUmumDetail::create([
                'jurnal_id'  => $jurnal->id,
                'kode_akun'  => $mapping->kode_akun_kredit,
                'keterangan' => $keterangan,
                'jenis'      => 'kredit',
                'nominal'    => $invoice->total,
            ]);

            // Update status faktur
            $invoice->update(['status' => 'approved']);

            // Update status DO
            $invoice->deliveryOrder->update(['status' => 'invoiced']);
        });

        return response()->json(['message' => 'Faktur berhasil di-approve, DO diupdate ke invoiced, jurnal ditambahkan']);
    }

    public function rollback($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);

            if ($invoice->status !== 'approved') {
                abort(400, 'Hanya faktur yang sudah approved yang bisa di-rollback');
            }

            $keterangan = $invoice->nomor_invoice . ' - ' . $invoice->pelanggan->nama_pelanggan;

            // Hapus detail jurnal sesuai faktur
            JurnalUmumDetail::where('keterangan', $keterangan)->delete();

            // Cek semua jurnal di tanggal yang sama
            $jurnals = JurnalUmum::whereDate('tanggal', $invoice->tanggal)
                ->where('kode_jurnal', 'like', 'JU-SI-' . date('Ymd', strtotime($invoice->tanggal)) . '%')
                ->get();

            foreach ($jurnals as $jurnal) {
                if ($jurnal->details()->count() === 0) {
                    $tanggal = $jurnal->tanggal;
                    $jurnal->delete();
                    $this->resequenceJurnal($tanggal);
                }
            }

            $invoice->update(['status' => 'draft']);

            if ($invoice->deliveryOrder) {
                $invoice->deliveryOrder->update(['status' => 'approved']);
            }
        });

        return response()->json(['message' => 'Faktur berhasil di-rollback ke draft, jurnal dihapus jika kosong, DO dikembalikan ke approved']);
    }


    public function cancel($id)
    {
        DB::transaction(function () use ($id) {
            $invoice = SalesInvoice::with(['deliveryOrder', 'pelanggan'])->findOrFail($id);

            if ($invoice->status === 'approved') {
                // Cari jurnal berdasarkan reference
                $jurnal = JurnalUmum::where('reference', 'GROUPED-SI-' . date('Ymd', strtotime($invoice->tanggal)))->first();

                if ($jurnal) {
                    // Hapus detail jurnal sesuai keterangan invoice
                    $keterangan = $invoice->nomor_invoice . ' - ' . $invoice->pelanggan->nama_pelanggan;
                    JurnalUmumDetail::where('jurnal_id', $jurnal->id)
                        ->where('keterangan', $keterangan)
                        ->delete();

                    // Jika jurnal tidak punya detail, hapus jurnalnya
                    if (JurnalUmumDetail::where('jurnal_id', $jurnal->id)->count() === 0) {
                        $jurnal->forceDelete();
                    }
                }
            }

            // Hapus detail invoice
            SalesInvoiceDetail::where('id_invoice', $invoice->id)->delete();

            // Hapus invoice
            $invoice->delete();

            // Kembalikan status DO
            if ($invoice->deliveryOrder) {
                $invoice->deliveryOrder->update(['status' => 'approved']);
            }
        });

        return response()->json([
            'message' => 'Faktur berhasil dibatalkan. Jurnal umum dihapus jika tidak ada detail tersisa, DO dikembalikan ke approved'
        ]);
    }



    private function resequenceJurnal($tanggal)
    {
        $jurnals = JurnalUmum::whereDate('tanggal', $tanggal)
            ->where('kode_jurnal', 'like', 'JU-SI-' . date('Ymd', strtotime($tanggal)) . '%')
            ->orderBy('id')
            ->get();

        $counter = 1;
        foreach ($jurnals as $jurnal) {
            $newKode = 'JU-SI-' . date('Ymd', strtotime($tanggal)) . '-' . str_pad($counter, 4, '0', STR_PAD_LEFT);
            $jurnal->update(['kode_jurnal' => $newKode]);
            $counter++;
        }
    }

    private function generateKodeJurnal()
    {
        $today = date('Y-m-d');

        $lastJurnal = JurnalUmum::whereDate('tanggal', $today)
            ->where('kode_jurnal', 'like', 'JU-SI-' . date('Ymd') . '%')
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $lastJurnal ? ((int)substr($lastJurnal->kode_jurnal, -4) + 1) : 1;

        return 'JU-SI-' . date('Ymd') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
