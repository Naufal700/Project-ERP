<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJurnalUmumDetailTable extends Migration
{
    public function up()
    {
        Schema::create('jurnal_umum_detail', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jurnal_id'); // Relasi ke jurnal_umum
            $table->string('kode_akun'); // Kode akun COA
            $table->enum('jenis', ['debit', 'kredit']); // Debit atau kredit
            $table->decimal('nominal', 15, 2);
            $table->text('keterangan')->nullable()->change();
            $table->timestamps();

            $table->foreign('jurnal_id')->references('id')->on('jurnal_umum')->onDelete('cascade');
            $table->foreign('kode_akun')->references('kode_akun')->on('chartofaccount_m');
        });
    }

    public function down()
    {
        Schema::dropIfExists('jurnal_umum_detail');
    }
}
