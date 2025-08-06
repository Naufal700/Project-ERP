<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesOrder;
use App\Models\SalesQuotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;

class SalesOrderController extends Controller
{
    /**
     * Menampilkan semua SQ draft untuk di-approve jadi SO
     */
    public function index()
    {
        $draftQuotations = SalesQuotation::with(['pelanggan', 'details.produk'])
            ->where('status', 'draft')
            ->get();

        return response()->json($draftQuotations);
    }

    /**
     * Approve SQ menjadi SO (dipanggil dari bulkVerify)
     */
    public function approveQuotation($id)
    {
        try {
            $quotation = SalesQuotation::with('details')->findOrFail($id);

            // Cek apakah sudah ada SO untuk SQ ini
            $order = SalesOrder::where('id_quotation', $quotation->id)->first();

            if ($order) {
                // Jika sudah ada → update status & approved_by
                $order->update([
                    'status'      => 'approved',
                    'approved_by' => auth()->id(),
                ]);
            } else {
                // Generate nomor SO baru
                $lastOrder  = SalesOrder::orderBy('id', 'desc')->first();
                $nomorOrder = 'SO-' . date('Ymd') . '-' . str_pad(($lastOrder ? $lastOrder->id + 1 : 1), 4, '0', STR_PAD_LEFT);

                // Buat SO baru
                $order = SalesOrder::create([
                    'nomor_order'   => $nomorOrder,
                    'id_quotation'  => $quotation->id,
                    'id_pelanggan'  => $quotation->id_pelanggan,
                    'tanggal'       => now(),
                    'total'         => $quotation->details->sum(fn($d) => $d->qty * $d->harga),
                    'status'        => 'approved',
                    'approved_by'   => auth()->id(),
                    'source'        => 'sq', // ⬅ Tambahkan ini
                ]);


                // Buat detail SO (ppn & diskon default 0)
                foreach ($quotation->details as $detail) {
                    $order->details()->create([
                        'id_produk' => $detail->id_produk,
                        'qty'       => $detail->qty,
                        'harga'     => $detail->harga,
                        'ppn'       => 0,
                        'diskon'    => 0,
                    ]);
                }
            }

            // Update SQ menjadi approved
            $quotation->update(['status' => 'approved']);
            return $order;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Reject SQ
     */
    public function reject($id)
    {
        try {
            $quotation = SalesQuotation::findOrFail($id);
            $quotation->update(['status' => 'rejected']);

            return response()->json(['message' => 'Sales Quotation berhasil direject']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal reject Sales Quotation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel SO → kembalikan SQ ke draft
     */
    public function cancel($id)
    {
        DB::beginTransaction();
        try {
            $order = SalesOrder::with('quotation')->findOrFail($id);

            if ($order->quotation) {
                $order->quotation->update(['status' => 'draft']);
            }

            $order->details()->delete();
            $order->delete();

            DB::commit();

            return response()->json([
                'message' => 'Sales Order berhasil dibatalkan, SQ dikembalikan ke draft, dan SO dihapus',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membatalkan Sales Order',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ambil semua SQ draft
     */
    public function draftQuotations()
    {
        $drafts = SalesQuotation::with(['pelanggan', 'details.produk'])
            ->where('status', 'draft')
            ->get();

        return response()->json($drafts);
    }

    /**
     * Ambil semua Sales Order
     */
    public function listOrders()
    {
        $orders = SalesOrder::with([
            'quotation.pelanggan',
            'pelanggan',
            'details.produk',
            'approvedByUser'
        ])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($order) {
                $order->source = $order->id_quotation ? 'sq' : 'manual';
                return $order;
            });

        return response()->json($orders);
    }



    /**
     * Cetak Sales Order PDF
     */
    public function printPdf($id)
    {
        $order = SalesOrder::with([
            'quotation.pelanggan',
            'pelanggan',
            'details.produk',
            'approvedByUser'
        ])->findOrFail($id);

        $pdf = Pdf::loadView('pdf.sales_order', [
            'order'   => $order,
            'details' => $order->details
        ]);

        return $pdf->download('sales-order-' . $order->nomor_order . '.pdf');
    }

    /**
     * Bulk Verify
     */
    public function bulkVerify(Request $request)
    {
        $ids      = $request->ids;
        $products = $request->products ?? [];

        DB::beginTransaction();
        try {
            $orderMap = [];

            foreach ($ids as $id) {
                $order = $this->approveQuotation($id);
                $orderMap[$order->id_quotation] = $order->id;
            }

            foreach ($products as $product) {
                $orderId = $orderMap[$product['order_id']] ?? $product['order_id'];

                DB::table('sales_order_detail')
                    ->where('id_order', $orderId)
                    ->where('id_produk', $product['id_produk'])
                    ->update([
                        'ppn'    => $product['ppn'] ?? 0,
                        'diskon' => $product['diskon'] ?? 0,
                    ]);
            }

            DB::commit();
            return response()->json(['message' => 'Sales Order terpilih berhasil diverifikasi']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal verifikasi bulk',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store Sales Order manual
     */
    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'id_pelanggan' => 'required|exists:pelanggan_m,id',
            'details' => 'required|array|min:1',
            'details.*.id_produk' => 'required|exists:produk_m,id',
            'details.*.qty' => 'required|numeric|min:1',
            'details.*.harga' => 'required|numeric|min:0',
            'details.*.ppn' => 'nullable|numeric|min:0|max:100',
            'details.*.diskon' => 'nullable|numeric|min:0|max:100',
        ]);

        DB::beginTransaction();
        try {
            $lastOrder  = SalesOrder::orderBy('id', 'desc')->first();
            $nomorOrder = 'SO-' . date('Ymd') . '-' . str_pad(($lastOrder ? $lastOrder->id + 1 : 1), 4, '0', STR_PAD_LEFT);

            // Hitung total menggunakan PPN & Diskon persentase
            $total = collect($request->details)->sum(function ($d) {
                $base = $d['qty'] * $d['harga'];
                $ppn = ($d['ppn'] ?? 0) / 100 * $base;
                $diskon = ($d['diskon'] ?? 0) / 100 * $base;
                return $base + $ppn - $diskon;
            });

            $order = SalesOrder::create([
                'nomor_order'      => $nomorOrder,
                'tanggal'          => $request->tanggal,
                'id_pelanggan'     => $request->id_pelanggan,
                'id_quotation'     => null,
                'total'            => $total,
                'status'           => 'approved',
                'approved_by'      => auth()->id() ?? null,
                'tanggal_approval' => now(),
                'source'           => 'manual', // jika ada kolom source di tabel
            ]);

            foreach ($request->details as $detail) {
                $base = $detail['qty'] * $detail['harga']; // harga * qty
                $ppnNominal = (($detail['ppn'] ?? 0) / 100) * $base;
                $diskonNominal = (($detail['diskon'] ?? 0) / 100) * $base;

                $order->details()->create([
                    'id_produk' => $detail['id_produk'],
                    'qty'       => $detail['qty'],
                    'harga'     => $detail['harga'],
                    'ppn'       => $ppnNominal,     // simpan nominal PPN
                    'diskon'    => $diskonNominal,  // simpan nominal Diskon
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Sales Order berhasil dibuat',
                'data'    => $order->load('details.produk', 'pelanggan')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat Sales Order manual',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'id_pelanggan' => 'required|exists:pelanggan_m,id',
            'details' => 'required|array|min:1',
            'details.*.id_produk' => 'required|exists:produk_m,id',
            'details.*.qty' => 'required|numeric|min:1',
            'details.*.harga' => 'required|numeric|min:0',
            'details.*.ppn' => 'nullable|numeric|min:0|max:100',
            'details.*.diskon' => 'nullable|numeric|min:0|max:100',
        ]);

        DB::beginTransaction();
        try {
            $order = SalesOrder::with('details')->findOrFail($id);

            if ($order->status !== 'approved') {
                return response()->json(['message' => 'Sales Order tidak dapat diubah'], 400);
            }

            $total = collect($request->details)->sum(function ($d) {
                $base = $d['qty'] * $d['harga'];
                $ppn = ($d['ppn'] ?? 0) / 100 * $base;
                $diskon = ($d['diskon'] ?? 0) / 100 * $base;
                return $base + $ppn - $diskon;
            });

            $order->update([
                'tanggal'      => $request->tanggal,
                'id_pelanggan' => $request->id_pelanggan,
                'total'        => $total,
                'source'       => 'manual', // ⬅ Pastikan tetap manual jika diupdate
            ]);

            $order->details()->delete();

            foreach ($request->details as $detail) {
                $base = $detail['qty'] * $detail['harga']; // harga * qty
                $ppnNominal = (($detail['ppn'] ?? 0) / 100) * $base;
                $diskonNominal = (($detail['diskon'] ?? 0) / 100) * $base;

                $order->details()->create([
                    'id_produk' => $detail['id_produk'],
                    'qty'       => $detail['qty'],
                    'harga'     => $detail['harga'],
                    'ppn'       => $ppnNominal,     // simpan nominal PPN
                    'diskon'    => $diskonNominal,  // simpan nominal Diskon
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Sales Order berhasil diperbarui',
                'data'    => $order->load('details.produk', 'pelanggan')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui Sales Order',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
