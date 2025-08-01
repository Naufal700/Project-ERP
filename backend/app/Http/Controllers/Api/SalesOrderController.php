<?php

namespace App\Http\Controllers\Api;

use App\Models\SalesOrder;
use App\Models\SalesQuotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class SalesOrderController extends Controller
{
    /**
     * Menampilkan semua Sales Order yang sudah dibuat
     */
    public function index()
    {
        $orders = SalesOrder::with(['pelanggan', 'details.produk', 'quotation'])->get();
        return response()->json($orders);
    }

    /**
     * Menampilkan detail Sales Order
     */
    public function show($id)
    {
        $order = SalesOrder::with(['pelanggan', 'details.produk', 'quotation'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Approve Quotation → buat Sales Order otomatis
     */
    public function approveQuotation($id)
    {
        DB::beginTransaction();
        try {
            $quotation = SalesQuotation::with('details')->findOrFail($id);

            // Generate nomor SO
            $lastOrder = SalesOrder::orderBy('id', 'desc')->first();
            $nomorOrder = 'SO-' . date('Ymd') . '-' . str_pad(($lastOrder ? $lastOrder->id + 1 : 1), 4, '0', STR_PAD_LEFT);

            // Buat Sales Order
            $order = SalesOrder::create([
                'nomor_order'   => $nomorOrder,
                'id_quotation'  => $quotation->id,
                'id_pelanggan'  => $quotation->id_pelanggan,
                'tanggal'       => now(),
                'total'         => $quotation->details->sum(fn($d) => $d->qty * $d->harga),
                'status'        => 'approved',
            ]);

            foreach ($quotation->details as $detail) {
                $order->details()->create([
                    'id_produk' => $detail->id_produk,
                    'qty'       => $detail->qty,
                    'harga'     => $detail->harga,
                    'subtotal'  => $detail->qty * $detail->harga,
                ]);
            }

            // Update status Quotation jadi approved
            $quotation->update(['status' => 'approved']);

            DB::commit();

            return response()->json([
                'message'       => 'Quotation berhasil di-approve & Sales Order dibuat',
                'nomor_order'   => $nomorOrder,
                'sales_order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal approve quotation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject Quotation → update status jadi rejected
     */
    public function rejectQuotation($id)
    {
        $quotation = SalesQuotation::findOrFail($id);
        $quotation->update(['status' => 'rejected']);

        return response()->json(['message' => 'Quotation berhasil di-reject']);
    }

    /**
     * Ambil semua Sales Order
     */
    public function listOrders()
    {
        $orders = SalesOrder::with(['pelanggan', 'details.produk', 'quotation'])->get();
        return response()->json($orders);
    }

    /**
     * Ambil semua draft quotation untuk di-approve
     */
    public function draftQuotations()
    {
        $drafts = SalesQuotation::with(['pelanggan', 'details.produk'])
            ->where('status', 'draft')
            ->get();
        return response()->json($drafts);
    }
    public function cancel($id)
    {
        $order = SalesOrder::with('quotation')->findOrFail($id);

        DB::beginTransaction();
        try {
            // Ubah status SO menjadi draft
            $order->update(['status' => 'draft']);

            // Jika ada quotation terkait, kembalikan statusnya ke draft
            if ($order->quotation) {
                $order->quotation->update(['status' => 'draft']);
            }

            DB::commit();
            return response()->json(['message' => 'Sales Order berhasil dibatalkan dan SQ dikembalikan ke draft']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan SO', 'error' => $e->getMessage()], 500);
        }
    }
}
