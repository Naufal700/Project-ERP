<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSatuanMTable extends Migration
{
    public function up(): void
    {
        Schema::create('satuan_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_satuan')->unique();
            $table->string('nama_satuan');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('satuan_m');
    }
}
