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
        Schema::create('proyek_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode_proyek')->unique();
            $table->string('nama_proyek');
            $table->enum('tipe_penanggung_jawab', ['karyawan', 'opsional'])->nullable();
            $table->unsignedBigInteger('id_karyawan')->nullable();
            $table->string('nama_penanggung_jawab_opsional')->nullable();
            $table->timestamps();

            $table->foreign('id_karyawan')->references('id')->on('karyawan_m')->onDelete('set null');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyek_m');
    }
};
