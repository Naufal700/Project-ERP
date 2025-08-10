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

            $table->unsignedBigInteger('cara_bayar_id')->nullable(); // FK ke cara_bayar_m
            $table->unsignedBigInteger('bank_id')->nullable(); // FK ke bank_m
            $table->string('kode_akun_debit');   // FK ke chartofaccount_m
            $table->string('kode_akun_kredit');  // FK ke chartofaccount_m

            $table->text('keterangan')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('kode_akun_debit')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
            $table->foreign('kode_akun_kredit')->references('kode_akun')->on('chartofaccount_m')->onDelete('restrict');
            $table->foreign('cara_bayar_id')->references('id')->on('cara_bayar_m')->onDelete('set null');
            $table->foreign('bank_id')->references('id')->on('bank_m')->onDelete('set null');
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
