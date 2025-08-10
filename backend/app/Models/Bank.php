<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    protected $table = 'bank_m';

    protected $fillable = [
        'nama_bank',
        'no_rekening',
        'nama_pemilik',
        'kode_akun',
    ];

    public function akun()
    {
        return $this->belongsTo(Coa::class, 'kode_akun', 'kode_akun');
    }
}
