<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesInvoice extends Model
{
    protected $table = 'sales_invoice';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nomor_invoice',
        'tanggal',
        'id_pelanggan',
        'id_do',
        'status',
        'total',
    ];

    public function details()
    {
        return $this->hasMany(SalesInvoiceDetail::class, 'id_invoice');
    }

    public function deliveryOrder()
    {
        return $this->belongsTo(DeliveryOrder::class, 'id_do');
    }

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan');
    }
}
