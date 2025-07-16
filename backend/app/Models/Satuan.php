<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Satuan extends Model
{
    protected $table = 'satuan_m';

    protected $fillable = [
        'kode_satuan',
        'nama_satuan',
        'keterangan',
    ];
}
