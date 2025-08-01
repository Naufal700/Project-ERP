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
        'kode_akun_debit',
        'kode_akun_kredit',
        'keterangan',
    ];

    public function akunDebit()
    {
        return $this->belongsTo(Coa::class, 'kode_akun_debit', 'kode_akun');
    }

    public function akunKredit()
    {
        return $this->belongsTo(Coa::class, 'kode_akun_kredit', 'kode_akun');
    }
}
