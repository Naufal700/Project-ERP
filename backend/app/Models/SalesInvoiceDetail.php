<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesInvoiceDetail extends Model
{
    protected $table = 'sales_invoice_detail';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id_invoice',
        'id_produk',
        'qty',
        'harga',
        'subtotal',
        'diskon',
        'ppn'
    ];

    public function invoice()
    {
        return $this->belongsTo(SalesInvoice::class, 'id_invoice');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk');
    }
    public function salesOrderDetail()
    {
        return $this->belongsTo(SalesOrderDetail::class, 'id_sales_order_detail', 'id');
    }
}
