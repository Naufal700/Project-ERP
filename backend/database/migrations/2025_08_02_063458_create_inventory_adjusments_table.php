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
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_gudang');
            $table->decimal('qty_awal', 18, 2);
            $table->decimal('qty_akhir', 18, 2);
            $table->string('alasan')->nullable();
            $table->timestamps();

            $table->foreign('id_produk')->references('id')->on('produk_m')->cascadeOnDelete();
            $table->foreign('id_gudang')->references('id')->on('gudang_m')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_adjusments');
    }
};
