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
        Schema::create('inventory_mutations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_gudang_asal')->nullable();
            $table->unsignedBigInteger('id_gudang_tujuan')->nullable();
            $table->decimal('qty', 18, 2);
            $table->string('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_produk')->references('id')->on('produk_m')->cascadeOnDelete();
            $table->foreign('id_gudang_asal')->references('id')->on('gudang_m')->nullOnDelete();
            $table->foreign('id_gudang_tujuan')->references('id')->on('gudang_m')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_mutations');
    }
};
