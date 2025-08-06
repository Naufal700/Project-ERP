<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\InventoryIssue;
use App\Models\JurnalUmum;
use App\Models\JurnalUmumDetail;
use App\Models\MappingJurnal;
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeliveryOrderController extends Controller
{
    /**
     * Ambil semua DO beserta relasi.
     */
    public function index()
    {
        return DeliveryOrder::with(['items.produk', 'salesOrder', 'pelanggan', 'approvedBy'])
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Ambil semua SO yang sudah approved tapi belum dibuat DO.
     */
    public function salesOrdersForDO()
    {
        return SalesOrder::with(['details.produk', 'pelanggan'])
            ->where('status', 'approved')
            ->whereDoesntHave('deliveryOrders')
            ->get();
    }

    /**
     * Generate nomor DO otomatis.
     */
    private function generateNoDO()
    {
        $lastDO = DeliveryOrder::orderBy('id', 'desc')->first();
        $nextNumber = $lastDO ? ((int)substr($lastDO->no_do, -4) + 1) : 1;
        return 'DO-' . date('Ymd') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Generate kode jurnal.
     */
    private function generateKodeJurnal($kodeTransaksi)
    {
        return 'JU-' . strtoupper($kodeTransaksi) . '-' . date('Ymd');
    }

    /**
     * Simpan DO baru berdasarkan SO (kirim full).
     */
    public function store(Request $request)
    {
        $request->validate([
            'sales_order_id' => 'required|exists:sales_order,id',
            'gudang_id'      => 'required|exists:gudang_m,id',
        ]);

        // Cek apakah sudah ada DO untuk SO yang sama
        if (DeliveryOrder::where('sales_order_id', $request->sales_order_id)->exists()) {
            return response()->json(['message' => 'DO untuk SO ini sudah ada'], 400);
        }

        DB::transaction(function () use ($request) {
            $salesOrder = SalesOrder::with('details')->findOrFail($request->sales_order_id);

            // Buat DO
            $do = DeliveryOrder::create([
                'no_do'          => $this->generateNoDO(),
                'sales_order_id' => $salesOrder->id,
                'pelanggan_id'   => $salesOrder->id_pelanggan,
                'tanggal'        => now(),
                'status'         => 'draft',
                'gudang_id'      => $request->gudang_id,
                'created_by'     => auth()->id(),
            ]);

            // Masukkan semua item dari SO ke DO
            foreach ($salesOrder->details as $item) {
                DeliveryOrderItem::create([
                    'delivery_order_id'     => $do->id,
                    'produk_id'             => $item->id_produk,
                    'qty'                   => $item->qty,
                    'harga'                 => $item->harga,
                    'total'                 => $item->qty * $item->harga,
                    'id_sales_order_detail' => $item->id, // simpan relasi ke SO detail
                ]);
            }
        });

        return response()->json(['message' => 'Delivery Order berhasil dibuat']);
    }

    /**
     * Approve DO sekaligus posting ke inventory issues dan buat jurnal.
     */
    public function approve($id)
    {
        DB::transaction(function () use ($id) {
            $do = DeliveryOrder::with(['items.produk', 'pelanggan'])->findOrFail($id);

            if ($do->status !== 'draft') {
                abort(400, 'Hanya DO dengan status draft yang dapat di-approve');
            }

            // Update status DO
            $do->update([
                'status'      => 'approved',
                'approved_by' => auth()->id(),
            ]);

            // Post ke inventory issues dan hitung HPP
            $totalHpp = 0;

            foreach ($do->items as $item) {
                // Ambil harga beli produk (bisa dari produk langsung atau FIFO/Average)
                $hargaBeli = $item->produk->harga_beli;

                InventoryIssue::create([
                    'produk_id'       => $item->produk_id,
                    'gudang_id'       => $do->gudang_id,
                    'tanggal'         => now(),
                    'reference'       => $do->no_do,
                    'jenis_transaksi' => 'DO',
                    'qty'             => $item->qty,
                    'harga'           => $hargaBeli,
                    'total'           => $item->qty * $hargaBeli,
                    'created_by'      => auth()->id(),
                ]);

                $totalHpp += $item->qty * $hargaBeli;
            }

            // Ambil mapping jurnal untuk pengeluaran persediaan
            $mapping = MappingJurnal::where('modul', 'sales/delivery')
                ->where('kode_transaksi', 'SD')
                ->first();

            if ($mapping) {
                // Cari jurnal yang sudah ada di tanggal ini
                $jurnal = JurnalUmum::whereDate('tanggal', now())
                    ->where('reference', 'DO-' . now()->format('Ymd'))
                    ->first();

                if (!$jurnal) {
                    // Buat jurnal umum baru
                    $jurnal = JurnalUmum::create([
                        'tanggal'     => now(),
                        'kode_jurnal' => $this->generateKodeJurnal('DO'),
                        'keterangan'  => 'Pengeluaran Persediaan Tanggal ' . now()->format('d/m/Y'),
                        'reference'   => 'DO-' . now()->format('Ymd'),
                        'created_by'  => auth()->id(),
                    ]);
                }

                // Tambahkan detail debit & kredit per item produk di DO ini
                foreach ($do->items as $item) {
                    $keteranganDetail = $do->no_do . ' - ' . $do->pelanggan->nama_pelanggan . ' - ' . $item->produk->nama_produk;
                    $nominalHpp = $item->qty * $item->produk->harga_beli;

                    // Debit HPP
                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnal->id,
                        'kode_akun'  => $mapping->kode_akun_debit,
                        'keterangan' => $keteranganDetail,
                        'jenis'      => 'debit',
                        'nominal'    => $nominalHpp,
                    ]);

                    // Kredit Persediaan
                    JurnalUmumDetail::create([
                        'jurnal_id'  => $jurnal->id,
                        'kode_akun'  => $mapping->kode_akun_kredit,
                        'keterangan' => $keteranganDetail,
                        'jenis'      => 'kredit',
                        'nominal'    => $nominalHpp,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Delivery Order berhasil di-approve dan jurnal diperbarui']);
    }

    /**
     * Detail DO.
     */
    public function show($id)
    {
        $do = DeliveryOrder::with(['items.produk', 'pelanggan', 'approvedBy'])->findOrFail($id);
        return response()->json($do);
    }

    /**
     * Cancel DO sekaligus hapus jurnal.
     */
    public function cancel($id)
    {
        DB::transaction(function () use ($id) {
            $do = DeliveryOrder::with(['items.produk', 'pelanggan'])->findOrFail($id);
            $so = $do->salesOrder;

            // Cari jurnal terkait DO (berdasarkan tanggal yang sama)
            $jurnal = JurnalUmum::where('reference', 'DO-' . Carbon::parse($do->tanggal)->format('Ymd'))->first();

            if ($jurnal) {
                // Hapus detail jurnal untuk DO ini
                JurnalUmumDetail::where('jurnal_id', $jurnal->id)
                    ->where('keterangan', 'like', $do->no_do . '%')
                    ->delete();

                // Jika tidak ada detail lagi, hapus jurnal umum
                if (JurnalUmumDetail::where('jurnal_id', $jurnal->id)->count() === 0) {
                    $jurnal->forceDelete();
                }
            }

            // Hapus inventory issues
            InventoryIssue::where('reference', $do->no_do)->delete();

            // Hapus DO
            $do->delete();

            // Kembalikan status SO
            if ($so) {
                $so->status = 'approved';
                $so->save();
            }
        });

        return response()->json(['message' => 'Delivery Order dibatalkan. Jurnal umum dihapus jika tidak ada detail tersisa.']);
    }
}
