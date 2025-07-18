<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('harga_jual_produk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_produk')->constrained('produk_m')->onDelete('cascade');
            $table->decimal('harga', 15, 2);
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harga_jual_produk');
    }
};
