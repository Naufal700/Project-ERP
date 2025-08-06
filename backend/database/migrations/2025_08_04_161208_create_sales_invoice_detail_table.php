<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_invoice_detail', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('id_invoice');
            $table->unsignedBigInteger('id_produk');
            $table->unsignedBigInteger('id_sales_order_detail')->nullable(); // relasi ke sales_order_detail
            $table->decimal('qty', 15, 2)->default(0);
            $table->decimal('harga', 15, 2)->default(0);
            $table->decimal('diskon', 15, 2)->default(0);
            $table->decimal('ppn', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0); // ubah jadi kolom biasa

            $table->foreign('id_invoice')
                ->references('id')
                ->on('sales_invoice')
                ->onDelete('cascade');

            $table->foreign('id_produk')
                ->references('id')
                ->on('produk_m')
                ->onDelete('restrict');

            $table->foreign('id_sales_order_detail')
                ->references('id')
                ->on('sales_order_detail')
                ->onDelete('set null'); // jika detail SO dihapus, set null
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_detail');
    }
};
