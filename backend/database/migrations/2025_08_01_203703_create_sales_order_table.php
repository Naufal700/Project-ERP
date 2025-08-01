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
        Schema::create('sales_order', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_order')->unique();
            $table->date('tanggal');
            $table->unsignedBigInteger('id_pelanggan');
            $table->unsignedBigInteger('id_quotation')->nullable(); // jika dari quotation
            $table->decimal('total', 15, 2)->default(0);
            $table->enum('status', ['draft', 'approved', 'rejected'])->default('draft');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('tanggal_approval')->nullable();
            $table->timestamps();

            $table->foreign('id_pelanggan')->references('id')->on('pelanggan_m')->onDelete('cascade');
            $table->foreign('id_quotation')->references('id')->on('sales_quotation')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
