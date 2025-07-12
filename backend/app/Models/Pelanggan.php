<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pelanggan extends Model
{
    protected $table = 'pelanggan_m';

    protected $fillable = [
        'kode_pelanggan',
        'nama_pelanggan',
        'email',
        'telepon',
        'alamat',
    ];
}
