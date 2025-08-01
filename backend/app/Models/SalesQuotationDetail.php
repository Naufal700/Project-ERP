<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesQuotationDetail extends Model
{
    use HasFactory;

    protected $table = 'sales_quotation_detail';

    protected $fillable = [
        'id_quotation',
        'id_produk',
        'qty',
        'harga',
        'subtotal',
    ];

    public function quotation()
    {
        return $this->belongsTo(SalesQuotation::class, 'id_quotation');
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk');
    }
}
