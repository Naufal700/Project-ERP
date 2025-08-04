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
        Schema::create('delivery_orders', function (Blueprint $table) {
            $table->id();
            $table->string('no_do')->unique();
            $table->unsignedBigInteger('sales_order_id')->nullable(); // Relasi ke Sales Order
            $table->unsignedBigInteger('pelanggan_id');
            $table->date('tanggal');
            $table->enum('status', ['draft', 'approved', 'shipped', 'completed', 'canceled', 'invoiced'])->default('draft');
            $table->unsignedBigInteger('gudang_id');
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();

            // Foreign Keys
            $table->foreign('sales_order_id')->references('id')->on('sales_orders')->onDelete('cascade');
            $table->foreign('pelanggan_id')->references('id')->on('pelanggan_m')->onDelete('cascade');
            $table->foreign('gudang_id')->references('id')->on('gudang_m')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_orders');
    }
};
