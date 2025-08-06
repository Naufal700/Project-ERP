<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel Bank
        Schema::create('bank_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_bank', 10)->unique(); // contoh: CASH, BCA, MANDIRI
            $table->string('nama_bank');               // contoh: Kas Kecil, Bank BCA
            $table->string('no_rekening')->nullable();
            $table->string('atas_nama')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Cara Bayar
        Schema::create('cara_bayar_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_cara_bayar', 10)->unique(); // contoh: CASH, TRANSFER, GIRO
            $table->string('nama_cara_bayar');              // contoh: Tunai, Transfer Bank, Giro
            $table->timestamps();
        });

        // 3. Tabel Pivot Bank - Cara Bayar
        Schema::create('bank_cara_bayar', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_bank');
            $table->unsignedBigInteger('id_cara_bayar');
            $table->timestamps();

            $table->foreign('id_bank')->references('id')->on('bank_m')->onDelete('cascade');
            $table->foreign('id_cara_bayar')->references('id')->on('cara_bayar_m')->onDelete('cascade');

            $table->unique(['id_bank', 'id_cara_bayar']); // Supaya tidak dobel kombinasi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_cara_bayar');
        Schema::dropIfExists('cara_bayar_m');
        Schema::dropIfExists('bank_m');
    }
};
