<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_quotation_detail', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_quotation');
            $table->unsignedBigInteger('id_produk');
            $table->integer('qty');
            $table->decimal('harga', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();

            $table->foreign('id_quotation')->references('id')->on('sales_quotation')->onDelete('cascade');
            $table->foreign('id_produk')->references('id')->on('produk_m');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_quotation_detail');
    }
};
