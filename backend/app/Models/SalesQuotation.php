<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesQuotation extends Model
{
    use HasFactory;

    protected $table = 'sales_quotation';

    protected $fillable = [
        'nomor_quotation',
        'tanggal',
        'id_pelanggan',
        'total',
        'status',
        'catatan',
        'created_by',
    ];

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan');
    }

    public function details()
    {
        return $this->hasMany(SalesQuotationDetail::class, 'id_quotation');
    }
}
