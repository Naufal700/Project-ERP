<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bank extends Model
{
    use HasFactory;

    protected $table = 'bank_m';

    protected $fillable = [
        'kode_bank',
        'nama_bank',
        'no_rekening',
        'atas_nama'
    ];

    public function caraBayar()
    {
        return $this->belongsToMany(CaraBayar::class, 'bank_cara_bayar', 'id_bank', 'id_cara_bayar')
            ->withTimestamps();
    }
}
