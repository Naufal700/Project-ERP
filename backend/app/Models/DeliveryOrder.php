<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryOrder extends Model
{
    protected $fillable = [
        'no_do',
        'sales_order_id',
        'pelanggan_id',
        'tanggal',
        'status',
        'gudang_id',
        'created_by',
        'approved_by',
    ];

    public function items()
    {
        return $this->hasMany(DeliveryOrderItem::class);
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'pelanggan_id');
    }


    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    public function salesInvoice()
    {
        return $this->hasOne(SalesInvoice::class, 'id_do');
    }
}
