<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HargaJualProduk extends Model
{
    protected $table = 'harga_jual_produk';
    protected $fillable = [
        'id_produk',
        'harga',
        'tanggal_mulai',
        'tanggal_berakhir',
        'aktif',
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class, 'id_produk', 'id');
    }
}
