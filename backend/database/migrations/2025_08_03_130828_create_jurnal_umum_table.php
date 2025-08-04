<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJurnalUmumTable extends Migration
{
    public function up()
    {
        Schema::create('jurnal_umum', function (Blueprint $table) {
            $table->id();
            $table->string('kode_jurnal')->unique(); // Kode jurnal otomatis (JUR-202508-0001)
            $table->date('tanggal'); // Tanggal transaksi jurnal
            $table->text('keterangan');
            $table->string('reference')->nullable(); // Keterangan umum jurnal
            $table->unsignedBigInteger('created_by'); // User yang buat
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('jurnal_umum');
    }
}
