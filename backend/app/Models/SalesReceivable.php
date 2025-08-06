<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesReceivable extends Model
{
    use HasFactory;

    protected $table = 'sales_receivable';
    protected $fillable = [
        'id_order',
        'total_tagihan',
        'sisa_tagihan',
        'status',
        'jatuh_tempo',
    ];

    public function order()
    {
        return $this->belongsTo(SalesOrder::class, 'id_order');
    }
}
