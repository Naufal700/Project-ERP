<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SalesTunai extends Model
{
    protected $table = 'sales_tunai';
    protected $guarded = [];

    protected static function booted()
    {
        static::creating(function ($payment) {
            $invoice = SalesInvoice::findOrFail($payment->sales_invoice_id);

            if (strtolower($invoice->jenis_pembayaran) !== 'tunai') {
                throw new \Exception(
                    "Tidak bisa mencatat pembayaran tunai untuk faktur dengan jenis pembayaran: {$invoice->jenis_pembayaran}"
                );
            }

            // ✅ Auto generate kode pembayaran kalau belum diisi
            if (empty($payment->kode_pembayaran)) {
                $payment->kode_pembayaran = self::generateKodePembayaran();
            }
        });
    }

    private static function generateKodePembayaran()
    {
        // Format: PAY-YYYYMMDD-XXXX
        $prefix = 'PAY-' . now()->format('Ymd') . '-';
        $lastNumber = self::where('kode_pembayaran', 'like', $prefix . '%')
            ->orderBy('kode_pembayaran', 'desc')
            ->pluck('kode_pembayaran')
            ->first();

        $next = 1;
        if ($lastNumber) {
            $lastSeq = (int) substr($lastNumber, -4);
            $next = $lastSeq + 1;
        }

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function salesInvoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'sales_invoice_id');
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class, 'bank_id');
    }

    public function caraBayar()
    {
        return $this->belongsTo(CaraBayar::class, 'cara_bayar_id');
    }
}
