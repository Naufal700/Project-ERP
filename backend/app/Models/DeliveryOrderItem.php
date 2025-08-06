<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryOrderItem extends Model
{
    protected $table = 'delivery_order_item';

    protected $fillable = [
        'delivery_order_id',
        'produk_id',
        'qty',
        'harga',
        'total',
        'id_sales_order_detail'
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function salesOrderDetail()
    {
        return $this->belongsTo(SalesOrderDetail::class, 'id_sales_order_detail');
    }
}
