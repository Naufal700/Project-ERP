<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('inventory_closing', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('periode'); // contoh: 2025-07-31
            $table->unsignedBigInteger('produk_id');
            $table->string('metode', 10); // fifo / average
            $table->decimal('qty_akhir', 18, 2);
            $table->decimal('harga_akhir', 18, 2);
            $table->decimal('total_nilai', 18, 2);
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->foreign('produk_id')->references('id')->on('produk_m');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_closing');
    }
};
