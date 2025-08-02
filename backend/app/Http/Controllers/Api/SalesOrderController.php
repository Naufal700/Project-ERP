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
                ]);

                // Buat detail SO default (ppn & diskon default 0)
                foreach ($quotation->details as $detail) {
                    $order->details()->create([
                        'id_produk' => $detail->id_produk,
                        'qty'       => $detail->qty,
                        'harga'     => $detail->harga,
                        'subtotal'  => $detail->qty * $detail->harga,
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
            ->get();

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
            $orderMap = []; // mapping quotation → order

            // Approve semua SQ jadi SO
            foreach ($ids as $id) {
                $order = $this->approveQuotation($id);
                $orderMap[$order->id_quotation] = $order->id;
            }

            // Update PPN & Diskon berdasarkan id_order + id_produk
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
}
