<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyek extends Model
{
    use HasFactory;
    protected $table = 'proyek_m';
    protected $fillable = [
        'kode_proyek',
        'nama_proyek',
        'tipe_penanggung_jawab',
        'id_karyawan',
        'nama_penanggung_jawab_opsional'
    ];

    public function karyawan()
    {
        return $this->belongsTo(Karyawan::class, 'id_karyawan');
    }
}
