<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesQuotation;
use App\Models\SalesQuotationDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesQuotationController extends Controller
{
    public function index()
    {
        $quotations = SalesQuotation::with(['pelanggan', 'details.produk'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($quotations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tanggal' => 'required|date',
            'id_pelanggan' => 'required|exists:pelanggan_m,id',
            'details' => 'required|array|min:1',
            'details.*.id_produk' => 'required|exists:produk_m,id',
            'details.*.qty' => 'required|integer|min:1',
            'details.*.harga' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $nomor = $this->generateNomorQuotation();

            $quotation = SalesQuotation::create([
                'nomor_quotation' => $nomor,
                'tanggal' => $request->tanggal,
                'id_pelanggan' => $request->id_pelanggan,
                'total' => 0,
                'status' => 'draft',
                'catatan' => $request->catatan,
                'created_by' => auth()->id(),
            ]);

            $total = 0;
            foreach ($request->details as $item) {
                $subtotal = $item['qty'] * $item['harga'];
                $total += $subtotal;

                SalesQuotationDetail::create([
                    'id_quotation' => $quotation->id,
                    'id_produk' => $item['id_produk'],
                    'qty' => $item['qty'],
                    'harga' => $item['harga'],
                    'subtotal' => $subtotal,
                ]);
            }

            $quotation->update(['total' => $total]);

            return response()->json($quotation->load('details.produk'), 201);
        });
    }

    public function show($id)
    {
        $quotation = SalesQuotation::with(['pelanggan', 'details.produk'])->findOrFail($id);
        return response()->json($quotation);
    }

    public function update(Request $request, $id)
    {
        $quotation = SalesQuotation::findOrFail($id);

        $request->validate([
            'tanggal' => 'required|date',
            'id_pelanggan' => 'required|exists:pelanggan_m,id',
            'details' => 'required|array|min:1',
            'details.*.id_produk' => 'required|exists:produk_m,id',
            'details.*.qty' => 'required|integer|min:1',
            'details.*.harga' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($quotation, $request) {
            $quotation->update([
                'tanggal' => $request->tanggal,
                'id_pelanggan' => $request->id_pelanggan,
                'catatan' => $request->catatan,
            ]);

            $quotation->details()->delete();

            $total = 0;
            foreach ($request->details as $item) {
                $subtotal = $item['qty'] * $item['harga'];
                $total += $subtotal;

                SalesQuotationDetail::create([
                    'id_quotation' => $quotation->id,
                    'id_produk' => $item['id_produk'],
                    'qty' => $item['qty'],
                    'harga' => $item['harga'],
                    'subtotal' => $subtotal,
                ]);
            }

            $quotation->update(['total' => $total]);

            return response()->json($quotation->load('details.produk'));
        });
    }

    public function destroy($id)
    {
        SalesQuotation::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function approve($id)
    {
        $quotation = SalesQuotation::findOrFail($id);
        $quotation->update(['status' => 'approved']);
        return response()->json($quotation);
    }

    public function reject($id)
    {
        $quotation = SalesQuotation::findOrFail($id);
        $quotation->update(['status' => 'rejected']);
        return response()->json($quotation);
    }

    /**
     * Generate nomor quotation otomatis (SQ-2025-0001)
     */
    private function generateNomorQuotation()
    {
        $prefix = 'SQ-' . date('Y');
        $lastQuotation = SalesQuotation::where('nomor_quotation', 'like', $prefix . '%')
            ->orderBy('nomor_quotation', 'desc')
            ->first();

        if (!$lastQuotation) {
            return $prefix . '-0001';
        }

        $lastNumber = intval(substr($lastQuotation->nomor_quotation, -4));
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . '-' . $newNumber;
    }
}
