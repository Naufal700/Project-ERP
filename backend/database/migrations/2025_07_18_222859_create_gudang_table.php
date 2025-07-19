<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGudangTable extends Migration
{
    public function up(): void
    {
        Schema::create('gudang_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_gudang', 10)->unique();
            $table->string('nama_gudang', 100);
            $table->text('alamat');
            $table->string('penanggung_jawab', 100);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gudangs_m');
    }
}
