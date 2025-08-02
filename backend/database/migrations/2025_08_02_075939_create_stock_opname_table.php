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
        Schema::create('stock_opname', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('produk_id');
            $table->unsignedBigInteger('gudang_id');
            $table->decimal('selisih_qty', 15, 2);
            $table->decimal('harga', 15, 2);
            $table->decimal('total', 18, 2);
            $table->timestamps();

            $table->foreign('produk_id')->references('id')->on('produk_m');
            $table->foreign('gudang_id')->references('id')->on('gudang_m');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_opname');
    }
};
