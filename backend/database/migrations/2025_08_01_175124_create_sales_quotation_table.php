<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_quotation', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_quotation')->unique();
            $table->date('tanggal');
            $table->unsignedBigInteger('id_pelanggan');
            $table->decimal('total', 15, 2)->default(0);
            $table->enum('status', ['draft', 'approved', 'rejected'])->default('draft');
            $table->text('catatan')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('id_pelanggan')->references('id')->on('pelanggan_m');
            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_quotation');
    }
};
