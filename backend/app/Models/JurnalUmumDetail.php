<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JurnalUmumDetail extends Model
{
    protected $table = 'jurnal_umum_detail';

    protected $fillable = [
        'jurnal_id',
        'kode_akun',
        'jenis',
        'nominal',
        'keterangan'
    ];

    public function coa()
    {
        return $this->belongsTo(Coa::class, 'kode_akun', 'kode_akun');
    }
}
