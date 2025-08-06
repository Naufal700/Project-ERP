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
        Schema::create('delivery_order_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('delivery_order_id');
            $table->unsignedBigInteger('produk_id');
            $table->unsignedBigInteger('id_sales_order_detail')->nullable(); // ✅ relasi ke sales_order_detail
            $table->decimal('qty', 15, 2);
            $table->decimal('harga', 15, 2)->nullable();
            $table->decimal('total', 18, 2)->nullable();
            $table->timestamps();

            $table->foreign('delivery_order_id')
                ->references('id')
                ->on('delivery_orders')
                ->onDelete('cascade');

            $table->foreign('produk_id')
                ->references('id')
                ->on('produk_m');

            $table->foreign('id_sales_order_detail') // ✅ tambahkan FK
                ->references('id')
                ->on('sales_order_detail')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_order_item'); // ✅ perbaiki nama tabel
    }
};
