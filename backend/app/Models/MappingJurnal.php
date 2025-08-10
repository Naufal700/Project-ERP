<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MappingJurnal extends Model
{
    use HasFactory;

    protected $table = 'mapping_jurnal';

    protected $fillable = [
        'modul',
        'kode_transaksi',
        'nama_transaksi',
        'cara_bayar_id',
        'bank_id',
        'kode_akun_debit',
        'kode_akun_kredit',
        'keterangan',
    ];

    // Relasi ke COA (akun debit)
    public function akunDebit()
    {
        return $this->belongsTo(Coa::class, 'kode_akun_debit', 'kode_akun');
    }

    // Relasi ke COA (akun kredit)
    public function akunKredit()
    {
        return $this->belongsTo(Coa::class, 'kode_akun_kredit', 'kode_akun');
    }

    // Relasi ke Cara Bayar
    public function caraBayar()
    {
        return $this->belongsTo(CaraBayar::class, 'cara_bayar_id');
    }

    // Relasi ke Bank
    public function bank()
    {
        return $this->belongsTo(Bank::class, 'bank_id');
    }
}
