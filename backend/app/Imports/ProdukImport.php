<?php

namespace App\Imports;

use App\Models\Produk;
use App\Models\KategoriProduk;
use App\Models\Satuan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProdukImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        if (!isset($row['kode_produk']) || !isset($row['nama_produk'])) {
            return null;
        }

        // Cari kategori, jika tidak ada maka buat baru beserta kode_kategori
        $kategori = KategoriProduk::firstOrCreate(
            ['nama_kategori' => $row['kategori'] ?? 'Lainnya'],
            ['kode_kategori' => $this->generateKodeKategori($row['kategori'] ?? 'Lainnya')]
        );

        // Cari satuan, jika tidak ada maka buat baru beserta kode_satuan
        $satuan = Satuan::firstOrCreate(
            ['nama_satuan' => $row['satuan'] ?? 'PCS'],
            ['kode_satuan' => $this->generateKodeSatuan($row['satuan'] ?? 'PCS')]
        );

        // Validasi jenis produk
        $jenisProduk = strtolower($row['jenis_produk'] ?? 'persediaan');
        if (!in_array($jenisProduk, ['persediaan', 'non_persediaan', 'service'])) {
            $jenisProduk = 'persediaan';
        }

        return new Produk([
            'kode_produk'  => $row['kode_produk'],
            'nama_produk'  => $row['nama_produk'],
            'id_kategori'  => $kategori->id,
            'id_satuan'    => $satuan->id,
            'harga_beli'   => $row['harga_beli'] ?? 0,
            'harga_jual'   => $row['harga_jual'] ?? 0,
            'jenis_produk' => $jenisProduk, // ✅ Tambahkan jenis produk
            'is_aktif'     => strtolower($row['status'] ?? 'aktif') === 'aktif',
        ]);
    }

    private function generateKodeKategori($nama)
    {
        $prefix = strtoupper(substr($nama, 0, 3)); // 3 huruf pertama
        $count = KategoriProduk::where('kode_kategori', 'like', $prefix . '%')->count() + 1;
        return $prefix . str_pad($count, 3, '0', STR_PAD_LEFT);
    }

    private function generateKodeSatuan($nama)
    {
        $prefix = strtoupper(substr($nama, 0, 3));
        $count = Satuan::where('kode_satuan', 'like', $prefix . '%')->count() + 1;
        return $prefix . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
