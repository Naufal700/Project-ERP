<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesPiutang extends Model
{
    use HasFactory;

    protected $table = 'sales_piutang';

    protected $fillable = [
        'sales_invoice_id',
        'tanggal_jatuh_tempo',
        'jumlah_piutang',
        'jumlah_terbayar',
        'status',
        'keterangan',
        'nomor_collecting'
    ];

    // Relasi ke SalesInvoice
    public function salesInvoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'sales_invoice_id');
    }
}
