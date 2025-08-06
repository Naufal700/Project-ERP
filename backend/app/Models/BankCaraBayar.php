<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankCaraBayar extends Model
{
    use HasFactory;

    protected $table = 'bank_cara_bayar';

    protected $fillable = [
        'id_bank',
        'id_cara_bayar',
    ];

    public function bank()
    {
        return $this->belongsTo(Bank::class, 'id_bank');
    }

    public function caraBayar()
    {
        return $this->belongsTo(CaraBayar::class, 'id_cara_bayar');
    }
}
