<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JurnalUmum extends Model
{
    use SoftDeletes;

    protected $table = 'jurnal_umum';

    protected $fillable = [
        'kode_jurnal',
        'tanggal',
        'keterangan',
        'reference',
        'created_by',
    ];

    public function details()
    {
        return $this->hasMany(JurnalUmumDetail::class, 'jurnal_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateKodeJurnal()
    {
        $prefix = 'JUR-' . date('Ym');
        $last = self::where('kode_jurnal', 'like', $prefix . '%')
            ->orderBy('kode_jurnal', 'desc')
            ->first();

        if ($last) {
            $lastNumber = (int) substr($last->kode_jurnal, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($jurnal) {
            if ($jurnal->isForceDeleting()) {
                $jurnal->details()->forceDelete();
            } else {
                $jurnal->details()->delete();
            }
        });
    }
}
