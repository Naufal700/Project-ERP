<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pajak_m', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->enum('jenis', ['ppn', 'pph', 'bea_masuk', 'pajak_daerah', 'non_pkp', 'bebas']);
            $table->enum('sub_jenis', ['ppn_masukan', 'ppn_keluaran', 'pph21', 'pph22', 'pph23', 'pph_final', 'tanpa_pajak'])->nullable();
            $table->decimal('persen', 5, 2)->default(0.00);
            $table->boolean('inclusive')->default(false);
            $table->boolean('is_aktif')->default(true);
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pajak_m');
    }
};
