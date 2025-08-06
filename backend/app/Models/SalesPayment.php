<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesPayment extends Model
{
    protected $table = 'sales_payment';
    protected $fillable = [
        'id_invoice',
        'tanggal_bayar',
        'metode',
        'jumlah_bayar',
        'keterangan'
    ];

    public function invoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'id_invoice');
    }
}
