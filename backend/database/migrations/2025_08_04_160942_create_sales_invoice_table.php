<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_invoice', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('nomor_invoice', 50)->unique();
            $table->date('tanggal')->default(DB::raw('CURRENT_DATE'));
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('id_do');
            $table->enum('status', ['draft', 'approved', 'paid'])->default('draft');
            $table->decimal('total', 15, 2)->default(0);
            $table->timestamps();

            // Relasi ke tabel pelanggan_m
            $table->foreign('id_pelanggan')
                ->references('id')
                ->on('pelanggan_m')
                ->onDelete('restrict');

            // Relasi ke tabel delivery_order
            $table->foreign('id_do')
                ->references('id')
                ->on('delivery_orders')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_invoice');
    }
};
