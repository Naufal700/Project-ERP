<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_tunai', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pembayaran')->unique(); // ✅ Kode pembayaran unik
            $table->unsignedBigInteger('sales_invoice_id'); // relasi ke sales_invoice
            $table->date('tanggal_bayar')->nullable();
            $table->decimal('jumlah_bayar', 15, 2);
            $table->unsignedBigInteger('bank_id')->nullable(); // jika transfer
            $table->unsignedBigInteger('cara_bayar_id')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('sales_invoice_id')->references('id')->on('sales_invoice')->onDelete('cascade');
            $table->foreign('bank_id')->references('id')->on('bank_m')->onDelete('set null');
            $table->foreign('cara_bayar_id')->references('id')->on('cara_bayar_m')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_tunai');
    }
};
