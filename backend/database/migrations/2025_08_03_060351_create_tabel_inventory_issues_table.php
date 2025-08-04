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
        Schema::create('inventory_issues', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('produk_id');
            $table->unsignedBigInteger('gudang_id');
            $table->date('tanggal');
            $table->string('reference')->nullable();
            $table->enum('jenis_transaksi', ['DO', 'RETUR', 'TRANSFER'])->default('DO');
            $table->decimal('qty', 15, 2);
            $table->decimal('harga', 15, 2)->nullable();
            $table->decimal('total', 18, 2)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('produk_id')->references('id')->on('produk_m');
            $table->foreign('gudang_id')->references('id')->on('gudang_m');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_issues');
    }
};
