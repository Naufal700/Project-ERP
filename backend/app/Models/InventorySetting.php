<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InventorySetting extends Model
{
    use HasFactory;

    protected $table = 'inventory_settings';

    protected $fillable = ['metode'];

    /**
     * Ambil pengaturan persediaan
     */
    public static function getSetting()
    {
        return DB::table('inventory_settings')->first();
    }

    /**
     * Update atau insert pengaturan persediaan
     */
    public static function updateSetting($metode)
    {
        $setting = DB::table('inventory_settings')->first();

        if ($setting) {
            DB::table('inventory_settings')->update([
                'metode' => $metode,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('inventory_settings')->insert([
                'metode' => $metode,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
