<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProdukTable extends Migration
{
    public function up(): void
    {
        Schema::create('produk_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_produk')->unique();
            $table->string('nama_produk');
            $table->unsignedBigInteger('id_kategori')->nullable();
            $table->unsignedBigInteger('id_satuan')->nullable();
            $table->decimal('harga_beli', 15, 2)->default(0);
            $table->decimal('harga_jual', 15, 2)->default(0);

            // Tambahkan kolom jenis_produk di sini
            $table->enum('jenis_produk', ['persediaan', 'non_persediaan', 'service'])->default('inventory');

            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->foreign('id_kategori')
                ->references('id')
                ->on('kategori_produk')
                ->nullOnDelete();

            $table->foreign('id_satuan')
                ->references('id')
                ->on('satuan_m')
                ->nullOnDelete();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('produk_m');
    }
}
