<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cara_bayar_m', function (Blueprint $table) {
            $table->id();
            $table->string('nama_cara_bayar'); // Tunai, Transfer, Giro
            $table->enum('tipe', ['kas', 'bank']);
            $table->string('kode_akun'); // FK ke COA

            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->foreign('kode_akun')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cara_bayar_m');
    }
};
