<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'supplier_m';

    protected $fillable = [
        'kode_supplier',
        'nama_supplier',
        'alamat',
        'email',
        'no_telepon',
        'npwp',
        'termin_pembayaran',
        'kategori',
    ];
}
