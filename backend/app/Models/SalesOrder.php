<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasFactory;

    protected $table = 'sales_order';
    protected $fillable = [
        'nomor_order',
        'tanggal',
        'id_pelanggan',
        'id_quotation',
        'total',
        'status',
        'approved_by',
        'tanggal_approval',
        'source'
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan');
    }

    public function details()
    {
        return $this->hasMany(SalesOrderDetail::class, 'id_order');
    }

    public function quotation()
    {
        return $this->belongsTo(SalesQuotation::class, 'id_quotation');
    }
    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
    public function deliveryOrders()
    {
        return $this->hasMany(DeliveryOrder::class, 'sales_order_id');
    }
    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id');
    }
}
