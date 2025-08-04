<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryIssue extends Model
{
    protected $table = 'inventory_issues';

    protected $fillable = [
        'produk_id',
        'gudang_id',
        'tanggal',
        'reference',
        'jenis_transaksi',
        'qty',
        'harga',
        'total',
        'created_by'
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    public function gudang()
    {
        return $this->belongsTo(Gudang::class, 'gudang_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
