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
        'jenis_pembayaran',      // tunai / piutang
        'termin',                // hari (nullable)
        'tanggal_jatuh_tempo',   // date (nullable)
        'status',
        'total',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'tanggal_jatuh_tempo' => 'date',
        'total' => 'decimal:2',
        'termin' => 'integer',
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
    public function salesTunai()
    {
        return $this->hasMany(SalesTunai::class);
    }
    public function salesPiutang()
    {
        return $this->hasMany(SalesPiutang::class, 'sales_invoice_id');
    }
    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }
}
