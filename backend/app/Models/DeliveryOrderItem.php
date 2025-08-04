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
        'total'
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }
}
