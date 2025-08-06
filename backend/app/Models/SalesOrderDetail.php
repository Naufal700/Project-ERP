<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrderDetail extends Model
{
    use HasFactory;

    protected $table = 'sales_order_detail';
    protected $fillable = [
        'id_order',
        'id_produk',
        'qty',
        'harga',
        'ppn',
        'diskon',
        'subtotal'
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id');
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'id_order');
    }
}
