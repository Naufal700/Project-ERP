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
        Schema::create('bank_m', function (Blueprint $table) {
            $table->id();
            $table->string('nama_bank'); // Contoh: Bank BCA, Mandiri
            $table->string('no_rekening')->nullable();
            $table->string('nama_pemilik')->nullable();
            $table->string('kode_akun'); // FK ke COA

            $table->timestamps();

            $table->foreign('kode_akun')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_m');
    }
};
