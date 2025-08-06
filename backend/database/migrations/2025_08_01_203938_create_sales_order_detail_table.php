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
        Schema::create('sales_order_detail', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_order');
            $table->unsignedBigInteger('id_produk');
            $table->integer('qty');
            $table->decimal('harga', 15, 2);
            $table->decimal('ppn', 15, 2);
            $table->decimal('diskon', 15, 2);
            $table->timestamps();

            $table->foreign('id_order')->references('id')->on('sales_order')->onDelete('cascade');
            $table->foreign('id_produk')->references('id')->on('produk_m')->onDelete('cascade');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_order_detail', function (Blueprint $table) {
            $table->dropColumn(['ppn', 'diskon']);
        });
    }
};
