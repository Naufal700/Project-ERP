<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk_m';

    protected $fillable = [
        'kode_produk',
        'nama_produk',
        'id_kategori',
        'id_satuan',
        'harga_beli',
        'harga_jual',
        'is_aktif'
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
        'harga_beli' => 'decimal:2',
        'harga_jual' => 'decimal:2',
    ];

    /**
     * Relasi ke kategori produk.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriProduk::class, 'id_kategori');
    }

    /**
     * Relasi ke satuan produk.
     */
    public function satuan()
    {
        return $this->belongsTo(Satuan::class, 'id_satuan');
    }
}
