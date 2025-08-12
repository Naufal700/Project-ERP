<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_piutang', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sales_invoice_id'); // relasi ke sales_invoice
            $table->date('tanggal_jatuh_tempo');
            $table->decimal('jumlah_piutang', 15, 2);
            $table->decimal('jumlah_terbayar', 15, 2)->default(0);
            $table->string('status')->default('belum lunas'); // belum lunas / lunas
            $table->text('keterangan')->nullable();
            $table->string('nomor_collecting')->nullable();
            $table->timestamps();

            $table->foreign('sales_invoice_id')->references('id')->on('sales_invoice')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_piutang');
    }
};
