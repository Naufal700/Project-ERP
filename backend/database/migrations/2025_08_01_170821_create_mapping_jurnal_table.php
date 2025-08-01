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
        Schema::create('mapping_jurnal', function (Blueprint $table) {
            $table->id();

            $table->string('modul'); // contoh: 'pesanan_penjualan', 'faktur_pembelian', dll
            $table->string('kode_transaksi'); // contoh: 'SO', 'PO', 'GR', 'AR'
            $table->string('nama_transaksi'); // contoh: 'Pesanan Penjualan', 'Faktur Pembelian'

            // Relasi ke chart of account
            $table->string('kode_akun_debit'); // relasi ke chartofaccount_m.kode_akun
            $table->string('kode_akun_kredit'); // relasi ke chartofaccount_m.kode_akun

            $table->text('keterangan')->nullable();

            $table->timestamps();

            // Foreign key relasi ke chartofaccount_m
            $table->foreign('kode_akun_debit')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
            $table->foreign('kode_akun_kredit')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mapping_jurnal');
    }
};
