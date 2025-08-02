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
        Schema::create('inventory_opening_balance', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_gudang');
            $table->decimal('qty', 18, 2)->default(0);
            $table->decimal('harga', 18, 2)->default(0);
            $table->decimal('total', 18, 2)->default(0);
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
        Schema::dropIfExists('inventory_opening_balance');
    }
};
