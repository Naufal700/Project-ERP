<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coa extends Model
{
    protected $table = 'chartofaccount_m';

    protected $fillable = [
        'kode_akun',
        'nama_akun',
        'level_akun',
        'parent_kode_akun',
        'kategori_akun',         // Contoh: Aset Lancar, Aset Tetap
        'tipe_akun',             // Contoh: Kas, Bank, Piutang
        'kategori_laporan',      // Contoh: neraca, laba_rugi
        'saldo_normal',          // debit / kredit
        'saldo_awal',
        'is_header',
        'is_aktif',
        'keterangan',
    ];

    public function parent()
    {
        return $this->belongsTo(Coa::class, 'parent_kode_akun', 'kode_akun');
    }

    public function children()
    {
        return $this->hasMany(Coa::class, 'parent_kode_akun', 'kode_akun');
    }
    public function mappingDebit()
    {
        return $this->hasMany(MappingJurnal::class, 'kode_akun_debit', 'kode_akun');
    }

    public function mappingKredit()
    {
        return $this->hasMany(MappingJurnal::class, 'kode_akun_kredit', 'kode_akun');
    }
    public function scopeKasBankOnly($query)
    {
        return $query->whereIn('tipe_akun', ['kas', 'bank']);
    }
}
