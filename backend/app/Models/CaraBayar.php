<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaraBayar extends Model
{
    use HasFactory;

    protected $table = 'cara_bayar_m';

    protected $fillable = [
        'kode_cara_bayar',
        'nama_cara_bayar'
    ];

    public function banks()
    {
        return $this->belongsToMany(Bank::class, 'bank_cara_bayar', 'id_cara_bayar', 'id_bank')
            ->withTimestamps();
    }
}
