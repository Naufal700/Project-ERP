<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gudang extends Model
{
    use HasFactory;
    protected $table = 'gudang_m';
    protected $fillable = [
        'kode_gudang',
        'nama_gudang',
        'alamat',
        'penanggung_jawab',
        'status',
    ];
}
