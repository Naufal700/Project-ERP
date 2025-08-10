<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaraBayar extends Model
{
    use HasFactory;

    protected $table = 'cara_bayar_m';

    protected $fillable = [
        'nama_cara_bayar',
        'tipe',
        'kode_akun',
        'is_default',
    ];

    public function akun()
    {
        return $this->belongsTo(Coa::class, 'kode_akun', 'kode_akun');
    }
}
