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
        Schema::create('chartofaccount_m', function (Blueprint $table) {
            $table->id();

            $table->string('kode_akun')->unique();
            $table->string('nama_akun');
            $table->tinyInteger('level_akun');
            $table->string('parent_kode_akun')->nullable();

            $table->string('kategori_akun')->nullable(); // Aset Lancar, dll
            $table->string('tipe_akun')->nullable(); // Kas, Bank, Persediaan, dll
            $table->string('kategori_laporan')->nullable(); // Neraca / Laba Rugi

            $table->enum('saldo_normal', ['debit', 'kredit']);
            $table->decimal('saldo_awal', 18, 2)->default(0);
            $table->boolean('is_header')->default(false);
            $table->boolean('is_aktif')->default(true);

            $table->text('keterangan')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chartofaccount_m');
    }
};
