<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    protected $table = 'karyawan_m';

    protected $fillable = [
        'nama_lengkap',
        'nip',
        'jenis_kelamin',
        'tanggal_lahir',
        'tempat_lahir',
        'alamat',
        'email',
        'no_hp',
        'jabatan',
        'divisi',
        'tanggal_masuk',
        'is_aktif',
    ];
}
